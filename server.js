require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*"],
            connectSrc: ["'self'", "https://api.emailjs.com"],
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
