package com.yourname.smsforwarder

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationManagerCompat

class MainActivity : AppCompatActivity() {
    private lateinit var etApiUrl: EditText
    private lateinit var btnSaveUrl: Button
    private lateinit var tvStatus: TextView
    private lateinit var sharedPrefs: SharedPreferences
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        initViews()
        setupSharedPrefs()
        loadSavedApiUrl()
        
        btnSaveUrl.setOnClickListener {
            saveApiUrl()
        }
    }

    override fun onResume() {
        super.onResume()
        // Check permission every time the app comes to the foreground
        // in case they just returned from the settings screen
        checkNotificationPermission()
    }
    
    private fun initViews() {
        etApiUrl = findViewById(R.id.etApiUrl)
        btnSaveUrl = findViewById(R.id.btnSaveUrl)
        tvStatus = findViewById(R.id.tvStatus)
    }
    
    private fun setupSharedPrefs() {
        sharedPrefs = getSharedPreferences("sms_forwarder_prefs", MODE_PRIVATE)
    }
    
    private fun checkNotificationPermission() {
        // Check if the app has been granted notification access
        val hasPermission = NotificationManagerCompat.getEnabledListenerPackages(this)
            .contains(packageName)
            
        if (!hasPermission) {
            updateStatus("Notification permission needed")
            Toast.makeText(this, "Please enable Notification Access for this app", Toast.LENGTH_LONG).show()
            
            // Redirect the user to the Notification Access settings screen
            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        } 
        else {
            updateStatus("Notification permissions granted")
        }
    }
    
    private fun saveApiUrl() {
        val apiUrl = etApiUrl.text.toString().trim()
        if (apiUrl.isNotEmpty()) {
            sharedPrefs.edit().putString("api_url", apiUrl).apply()
            Toast.makeText(this, "API URL saved", Toast.LENGTH_SHORT).show()
            updateStatus("API URL configured")
        } 
        else {
            Toast.makeText(this, "Please enter a valid API URL", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun loadSavedApiUrl() {
        val savedUrl = sharedPrefs.getString("api_url", "")
        etApiUrl.setText(savedUrl)
        if (!savedUrl.isNullOrEmpty()) {
            updateStatus("API URL loaded from preferences")
        }
    }
    
    private fun updateStatus(status: String) {
        tvStatus.text = "Status: $status"
    }
}