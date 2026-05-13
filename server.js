require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const path = require('path');
const compression = require('compression');
const app = express();
const PORT = process.env.PORT || 3000;

// Apply compression middleware to compress responses
app.use(compression());

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            // Allow images from Unsplash and Google Maps
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://maps.gstatic.com", "https://maps.googleapis.com"],
            // Allow the backend to talk to itself
            connectSrc: ["'self'"],
            // ALLOW YOUTUBE AND MAPS IFRAMES HERE:
            frameSrc: ["'self'", "https://www.youtube.com", "https://www.google.com", "https://maps.google.com"],
        },
    },
})); // Sets security HTTP headers

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Restrict to your frontend domain
    optionsSuccessStatus: 200
}));

// Apply general rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use(limiter);

// Specific rate limit for the email endpoint to prevent spam
const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 emails per hour
    message: 'Too many emails sent from this IP, please try again after an hour.'
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Send index.html for the root route (though express.static handles this if index.html exists)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create the transporter once for better efficiency
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // FORCE IPV4 TO PREVENT ENETUNREACH ERROR
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000,     // 10 seconds
    tls: {
        // This ensures the connection uses IPv4
        family: 4 
    }
});

// Example route for sending email
app.post('/send-email', emailLimiter, async (req, res) => {
    let { name, email, message } = req.body;

    // Input Validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }

    // Input Sanitization (prevent Cross-Site Scripting - XSS)
    name = validator.escape(name.trim());
    message = validator.escape(message.trim());

    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `New Message from ${name}`,
        text: message
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
