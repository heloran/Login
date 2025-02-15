const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',         // Gmail's SMTP server
    port: 587,                      // Use port 587 for TLS
    secure: false,                  // Secure set to false because we're using TLS
    auth: {
        user: 'nicholasdiraddo@gmail.com',  // Your Gmail address
        pass: 'fuluhttmcgfiqdim'   // Your App password (if 2FA is enabled) or Gmail password
    },
    tls: {
        rejectUnauthorized: false   // Optional, may be needed if you're on a strict network
    }
});

module.exports = transporter;
