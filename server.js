require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// FIX 1: Tell Express to trust Render's proxy
// This stops the X-Forwarded-For error!
// ==========================================
app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*"],
            connectSrc: ["'self'"],
            // Allows the Google Map and YouTube to load safely
            frameSrc: ["'self'", "https://www.youtube.com", "https://www.google.com", "https://maps.google.com"],
        },
    },
})); 

app.use(cors({
    origin: process.env.CLIENT_URL || '*', 
    optionsSuccessStatus: 200
}));

// Rate limiting settings
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use(limiter);

const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 5, 
    message: 'Too many emails sent from this IP, please try again after an hour.'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Email Route
app.post('/send-email', emailLimiter, async (req, res) => {
    let { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }

    name = validator.escape(name.trim());
    message = validator.escape(message.trim());

    // ==========================================
    // FIX 3: Use Port 587 (STARTTLS)
    // Bypasses cloud network blocks on port 465
    // ==========================================
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Must be false for port 587
        requireTLS: true, // Forces the connection to be secure
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // Keep IPv4 forced just in case
        family: 4 
    });

    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `New Message from ${name}`,
        text: `Message from: ${email}\n\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
