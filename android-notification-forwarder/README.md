# SMS Forwarder Android App

An Android application that automatically forwards incoming SMS messages to a configurable API endpoint.

## Features

- **Automatic SMS Detection**: Listens for incoming SMS messages in real-time
- **Message Parsing**: Extracts sender information and message content
- **API Integration**: Forwards SMS data to your custom API endpoint
- **Permission Management**: Handles SMS permissions with user-friendly prompts
- **Configurable**: Easy-to-use interface for setting up your API endpoint
- **Device Identification**: Generates unique device IDs for tracking

## SMS Data Format

The app sends SMS data to your API in the following JSON format:

```json
{
  "sender": "+1234567890",
  "message": "Your SMS message content",
  "timestamp": 1640995200000,
  "device_id": "unique-device-identifier",
  "received_at": 1640995201000
}
```

## Setup Instructions

1. **Configure Your API Endpoint**:
   - Open the app on your Android device
   - Enter your API endpoint URL (e.g., `https://your-api.com/sms`)
   - Tap "Save API URL"

2. **Grant Permissions**:
   - The app will automatically request SMS permissions
   - Grant "Receive SMS" and "Read SMS" permissions when prompted
   - These permissions are required for the app to function

3. **Testing**:
   - Send a test SMS to your device
   - Check your API logs to verify the SMS was forwarded successfully

## Requirements

- Android 7.0 (API level 24) or higher
- Internet connection for API communication
- SMS permissions (requested automatically)

## API Endpoint Requirements

Your API endpoint should:
- Accept POST requests
- Handle JSON content type (`application/json`)
- Return appropriate HTTP status codes (200 for success)

Example API endpoint implementation (Node.js/Express):

```javascript
app.post('/sms', (req, res) => {
    console.log('SMS received:', req.body);
    // Process the SMS data here
    res.status(200).json({ status: 'success' });
});
```

## Privacy & Security

- The app only forwards SMS messages to your configured API endpoint
- No messages are stored locally on the device
- Each device gets a unique identifier for tracking purposes
- All API communication happens over HTTPS (recommended)

## Building from Source

1. Clone the repository
2. Open in Android Studio
3. Update the package name in:
   - `AndroidManifest.xml`
   - `build.gradle` (app level)
   - All Kotlin files
4. Build and install on your device

## Troubleshooting

- **SMS not being forwarded**: Check that all permissions are granted
- **API errors**: Verify your API endpoint URL and that it accepts POST requests
- **App crashes**: Check Android logs for detailed error messages

## License

This project is open source and available under the MIT License.
