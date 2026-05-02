# Cold Outreach Pro 🚀

A premium cold mailing website designed to help you land your dream job by sending personalized emails to HRs with ease.

## Features
- **Premium UI**: Modern dark theme with glassmorphism and smooth animations.
- **HR Personalization**: Enter HR name, email, and the role you're applying for.
- **Bulk Outreach**: Upload a CSV file to send mass emails to multiple HRs at once.
- **Experience & Skills**: Highlight your expertise and key skills.
- **Resume Upload**: Attach your resume (PDF) directly to the email.
- **Seamless Sending**: Backend integration with Nodemailer for reliable delivery.

## Setup Instructions

### 1. Prerequisites
- Node.js installed on your machine.
- A Gmail account (or any other email service).

### 2. Configure Email (Gmail)
To send emails via Gmail, you need to use an **App Password**:
1. Go to your Google Account settings.
2. Search for "App Passwords".
3. Select "Mail" and "Other (Custom name)". Name it something like "Cold Mailing Tool".
4. Copy the 16-character password generated.

### 3. Backend Setup
1. Navigate to the `server` directory.
2. Create a `.env` file (copy from `.env.example`).
3. Fill in your credentials:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### 4. Running the Application
From the root directory, run:
```bash
npm install
npm run dev
```
This will start both the frontend (Vite) and the backend (Express).

## Tech Stack
- **Frontend**: React, Vite, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Nodemailer, Multer.
- **Styling**: Vanilla CSS (Custom Design System).

---
Built with ❤️ for career growth.

# cold-mailer-website
