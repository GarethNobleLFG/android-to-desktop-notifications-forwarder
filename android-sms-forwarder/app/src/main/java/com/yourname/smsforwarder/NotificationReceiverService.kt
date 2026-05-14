package com.yourname.smsforwarder

import android.content.Context
import android.graphics.Bitmap
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Base64
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.ByteArrayOutputStream

class NotificationReceiverService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val notification = sbn?.notification ?: return
        val extras = notification.extras
        
        // Ignore system notifications to reduce spam
        val appPackage = sbn.packageName
        if (appPackage == "android" || appPackage == "com.android.systemui") {
            return
        }
        
        // 1. Extract Text Data
        val title = extras.getString("android.title") ?: "Unknown Title"
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val bigText = extras.getCharSequence("android.bigText")?.toString() ?: ""
        
        // Prioritize bigText if it exists because it holds the expanded message
        val messageBody = if (bigText.isNotEmpty()) bigText else text
        
        // 2. Extract Image (if any) and convert to Base64
        var base64Image: String? = null
        val picture = extras.getParcelable<Bitmap>("android.picture")
        if (picture != null) {
            base64Image = bitmapToBase64(picture)
        }

        Log.d("NotificationService", "Push from $appPackage: $title - $messageBody (Has Image: ${picture != null})")
        
        // 3. Package it up into our new Data Class
        val data = NotificationData(
            appPackage = appPackage,
            title = title,
            message = messageBody,
            imageBase64 = base64Image,
            timestamp = sbn.postTime,
            deviceId = getDeviceId(applicationContext) 
        )
        
        // 4. Send it to the API
        CoroutineScope(Dispatchers.IO).launch {
            try {
                ApiService(applicationContext).forwardNotification(data)
            } catch (e: Exception) {
                Log.e("NotificationService", "Failed to forward notification", e)
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // Optional
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
            deviceId = java.util.UUID.randomUUID().toString()
            sharedPrefs.edit().putString("device_id", deviceId).apply()
        }
        return deviceId
    }
}

// Our updated data model
data class NotificationData(
    val appPackage: String,
    val title: String,
    val message: String,
    val imageBase64: String?, // Nullable if no image exists
    val timestamp: Long,
    val deviceId: String
)