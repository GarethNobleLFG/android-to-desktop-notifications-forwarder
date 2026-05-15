package com.yourname.smsforwarder

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class ApiService(private val context: Context) {
    
    companion object {
        private const val TAG = "ApiService"
        private const val TIMEOUT_MS = 10000
    }
    
    suspend fun forwardNotification(notificationData: NotificationData): Boolean = withContext(Dispatchers.IO) {
        try {
            val apiUrl = getApiUrl()
            if (apiUrl.isEmpty()) {
                Log.w(TAG, "API URL not configured")
                return@withContext false
            }
            
            val jsonPayload = createJsonPayload(notificationData)
            val response = sendHttpRequest(apiUrl, jsonPayload)
            
            Log.d(TAG, "API Response: $response")
            return@withContext true
            
        } 
        catch (e: Exception) {
            Log.e(TAG, "Error forwarding Notification to API", e)
            return@withContext false
        }
    }
    
    private fun getApiUrl(): String {
        val sharedPrefs = context.getSharedPreferences("sms_forwarder_prefs", Context.MODE_PRIVATE)
        return sharedPrefs.getString("api_url", "") ?: ""
    }
    
    private fun createJsonPayload(data: NotificationData): String {
        val jsonObject = JSONObject().apply {
            put("app_package", data.appPackage)
            put("title", data.title)
            put("message", data.message)
            put("timestamp", data.timestamp)
            put("device_id", data.deviceId)
            put("received_at", System.currentTimeMillis())
            
            // Only add the image if it exists
            if (data.imageBase64 != null) {
                put("image_base64", data.imageBase64)
            }
            
            // Only add the icon if it exists
            if (data.iconBase64 != null) {
                put("icon_base64", data.iconBase64)
            }
            
            // NEW: Only add the large icon if it exists
            if (data.largeIconBase64 != null) {
                put("large_icon_base64", data.largeIconBase64)
            }
        }
        return jsonObject.toString()
    }
    
    private fun sendHttpRequest(apiUrl: String, jsonPayload: String): String {
        val url = URL(apiUrl)
        val connection = url.openConnection() as HttpURLConnection
        
        try {
            connection.apply {
                requestMethod = "POST"
                doOutput = true
                doInput = true
                connectTimeout = TIMEOUT_MS
                readTimeout = TIMEOUT_MS
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                // Updated the user agent to reflect push notifications
                setRequestProperty("User-Agent", "Push-Forwarder-Android/1.0") 
            }
            
            // Send JSON payload
            OutputStreamWriter(connection.outputStream).use { writer ->
                writer.write(jsonPayload)
                writer.flush()
            }
            
            val responseCode = connection.responseCode
            Log.d(TAG, "HTTP Response Code: $responseCode")
            
            // Read response
            val response = if (responseCode == HttpURLConnection.HTTP_OK) {
                connection.inputStream.bufferedReader().readText()
            } 
            else {
                connection.errorStream?.bufferedReader()?.readText() ?: "No error message"
            }
            
            if (responseCode !in 200..299) {
                throw Exception("HTTP Error $responseCode: $response")
            }
            
            return response
            
        } 
        finally {
            connection.disconnect()
        }
    }
}