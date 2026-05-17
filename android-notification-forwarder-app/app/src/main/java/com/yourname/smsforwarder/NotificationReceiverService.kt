package com.yourname.smsforwarder

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Base64
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.ByteArrayOutputStream
import java.util.UUID

class NotificationReceiverService : NotificationListenerService() {

    // Small cache to remember the last notification sent for each app.
    private val lastSentNotifications = mutableMapOf<String, String>()

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val notification = sbn?.notification ?: return
        val extras = notification.extras
        
        val appPackage = sbn.packageName
                
        // Ignore core OS notifications to reduce spam, but let everything else through
        if (appPackage == "android" || appPackage == "com.android.systemui") {
            return
        }
        
        // 1. Extract Text Data
        val title = extras.getString("android.title") ?: "Unknown Title"
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val bigText = extras.getCharSequence("android.bigText")?.toString() ?: ""
        
        val messageBody = if (bigText.isNotEmpty()) bigText else text

        // Create a unique fingerprint based on the title and message
        val signature = "$title|$messageBody"
        
        // If the title and message body is the same content as the last time the app had a notifcation, ignore it.
        if (lastSentNotifications[appPackage] == signature) {
            return
        }
        
        // Otherwise, remember this signature for next time
        lastSentNotifications[appPackage] = signature
        
        // 2. Extract Image (if any) and convert to Base64
        var base64Image: String? = null
        val picture = extras.getParcelable<Bitmap>("android.picture")
        if (picture != null) {
            base64Image = bitmapToBase64(picture)
        }

        // 3. Extract the App Icon (Application Logo)
        var base64Icon: String? = null
        try {
            val pm = applicationContext.packageManager
            val drawable = pm.getApplicationIcon(appPackage)
            val bitmap = Bitmap.createBitmap(
                drawable.intrinsicWidth.coerceAtLeast(1),
                drawable.intrinsicHeight.coerceAtLeast(1),
                Bitmap.Config.ARGB_8888
            )
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            base64Icon = bitmapToBase64(bitmap)
        } 
        catch (e: Exception) {
            Log.e("NotificationService", "Failed to extract app icon", e)
        }

        // 3.5. Extract the Large Icon (Profile Picture / Avatar)
        var base64LargeIcon: String? = null
        try {
            val largeIcon = notification.getLargeIcon()
            if (largeIcon != null) {
                val drawable = largeIcon.loadDrawable(applicationContext)
                if (drawable != null) {
                    val bitmap = Bitmap.createBitmap(
                        drawable.intrinsicWidth.coerceAtLeast(1),
                        drawable.intrinsicHeight.coerceAtLeast(1),
                        Bitmap.Config.ARGB_8888
                    )
                    val canvas = Canvas(bitmap)
                    drawable.setBounds(0, 0, canvas.width, canvas.height)
                    drawable.draw(canvas)
                    base64LargeIcon = bitmapToBase64(bitmap)
                }
            }
        } 
        catch (e: Exception) {
            Log.e("NotificationService", "Failed to extract large icon", e)
        }

        // 4. Package it up
        val data = NotificationData(
            appPackage = appPackage,
            title = title,
            message = messageBody,
            imageBase64 = base64Image,
            iconBase64 = base64Icon,
            largeIconBase64 = base64LargeIcon,
            timestamp = sbn.postTime,
            deviceId = getDeviceId(applicationContext) 
        )
        
        // 5. Send it to the API
        CoroutineScope(Dispatchers.IO).launch {
            try {
                ApiService(applicationContext).forwardNotification(data)
            } catch (e: Exception) {
                Log.e("NotificationService", "Failed to forward notification", e)
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // Optional: clear the cache when a notification is dismissed if you want
        // a newly-posted identical notification to trigger again.
        // val appPackage = sbn?.packageName ?: return
        // lastSentNotifications.remove(appPackage)
    }
    
    // Helper to convert Android Bitmaps to Base64 string for JSON transit
    private fun bitmapToBase64(bitmap: Bitmap): String {
        val outputStream = ByteArrayOutputStream()
        // Compress to JPEG to save bandwidth (70% quality is usually fine for reading text over images)
        bitmap.compress(Bitmap.CompressFormat.JPEG, 70, outputStream)
        val byteArray = outputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }
    
    private fun getDeviceId(context: Context): String {
        val sharedPrefs = context.getSharedPreferences("sms_forwarder_prefs", Context.MODE_PRIVATE)
        var deviceId = sharedPrefs.getString("device_id", null)
        if (deviceId == null) {
            deviceId = UUID.randomUUID().toString()
            sharedPrefs.edit().putString("device_id", deviceId).apply()
        }
        return deviceId
    }
}

data class NotificationData(
    val appPackage: String,
    val title: String,
    val message: String,
    val imageBase64: String?, 
    val iconBase64: String?,
    val largeIconBase64: String?, 
    val timestamp: Long,
    val deviceId: String
)