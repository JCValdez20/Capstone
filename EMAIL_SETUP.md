# Email Verification Setup Guide

## Quick Setup for Development

For development/testing, the system will work without email configuration. When you register:

1. Check the backend console for the verification code
2. Copy the 6-digit code from the console logs
3. Enter it in the verification page

## Production Email Setup (Gmail)

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Turn on 2-Step Verification if not already enabled

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" from the dropdown
3. Click "Generate"
4. Copy the 16-character password (no spaces)

### Step 3: Update .env File

Replace this line in `backend/.env`:

```
EMAIL_PASS = your_app_password_here_replace_with_real_password
```

With:

```
EMAIL_PASS = your_16_character_app_password
```

### Step 4: Restart Backend Server

```bash
cd backend
npm start
```

## Alternative Email Providers

### Using Outlook/Hotmail

```env
EMAIL_HOST = smtp.live.com
EMAIL_PORT = 587
EMAIL_SECURE = false
EMAIL_USER = your_email@outlook.com
EMAIL_PASS = your_password
```

### Using Yahoo

```env
EMAIL_HOST = smtp.mail.yahoo.com
EMAIL_PORT = 587
EMAIL_SECURE = false
EMAIL_USER = your_email@yahoo.com
EMAIL_PASS = your_app_password
```

## Development Mode

Without proper email setup, the system automatically switches to development mode:

- ✅ Registration still works
- ✅ Verification codes appear in backend console
- ✅ All functionality works normally
- 📧 No actual emails sent

## Testing

1. Register a new account
2. Check backend console for verification code
3. Enter code on verification page
4. Login normally

The system is fully functional even without email setup!
