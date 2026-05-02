const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log('EMAIL_USER loaded:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS loaded:', !!process.env.EMAIL_PASS);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Helper to replace placeholders
const formatTemplate = (text, data) => {
  if (!text) return '';
  let formatted = text;
  
  const replacements = {
    'hrName': data.hrName || 'Hiring Manager',
    'role': data.role || 'the position',
    'experience': data.experience || 'several',
    'skills': data.skills || 'relevant technologies',
    'myName': data.myName || '[Your Name]'
  };

  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    formatted = formatted.replace(regex, value);
  });

  return formatted;
};

app.post('/api/send-email', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'bulkFile', maxCount: 1 }
]), async (req, res) => {
  const { mode, hrEmail, hrName, role, experience, skills, subject, body, myName } = req.body;
  const resume = req.files['resume'] ? req.files['resume'][0] : null;
  const bulkFile = req.files['bulkFile'] ? req.files['bulkFile'][0] : null;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ error: 'Email credentials not configured in server/.env' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  if (mode === 'single') {
    const finalSubject = formatTemplate(subject, { hrName, role, myName });
    const finalBody = formatTemplate(body, { hrName, role, experience, skills, myName });

    console.log('Sending single email to:', hrEmail);
    console.log('Final Subject:', finalSubject);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: hrEmail,
      subject: finalSubject,
      text: finalBody,
      attachments: resume ? [{ filename: resume.originalname, path: resume.path }] : []
    };

    const result = await sendMail(transporter, mailOptions);
    if (resume) fs.unlinkSync(resume.path);

    if (result.success) {
      return res.status(200).json({ message: 'Email sent successfully!' });
    } else {
      return res.status(500).json({ error: 'Failed to send email' });
    }
  } 
  
  if (mode === 'bulk') {
    if (!bulkFile) return res.status(400).json({ error: 'No CSV file uploaded' });

    const recipients = [];
    fs.createReadStream(bulkFile.path)
      .pipe(csv(['name', 'email']))
      .on('data', (data) => recipients.push(data))
      .on('end', async () => {
        let sentCount = 0;
        let failCount = 0;

        for (const recipient of recipients) {
          if (recipient.email === 'email' || !recipient.email) continue;

          const finalSubject = formatTemplate(subject, { hrName: recipient.name, role, myName });
          const finalBody = formatTemplate(body, { hrName: recipient.name, role, experience, skills, myName });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient.email,
            subject: finalSubject,
            text: finalBody,
            attachments: resume ? [{ filename: resume.originalname, path: resume.path }] : []
          };

          const result = await sendMail(transporter, mailOptions);
          if (result.success) sentCount++;
          else failCount++;
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (resume) fs.unlinkSync(resume.path);
        if (bulkFile) fs.unlinkSync(bulkFile.path);

        res.status(200).json({ 
          message: `Campaign finished! Sent: ${sentCount}, Failed: ${failCount}` 
        });
      });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
