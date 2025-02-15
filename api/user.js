const express = require('express');
const router = express.Router();
const User = require('./../models/user')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const transporter = require('./../config/nodemailer')
const path = require('path');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//sign up
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, passwordConfirm } = req.body;
        if (!name || !email || !password || !passwordConfirm) {
            return res.json({
                status: 'error',
                message: 'Please enter all required fields'
            });
        }
        if (password.length < 6) {
            return res.json({
                status: 'error',
                message: 'Please enter a password with more than 6 characters'
            });
        }
        if (password !== passwordConfirm) {
            return res.json({
                status: 'error',
                message: 'Passwords do not match'
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                status: 'error',
                message: 'User already exists'
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        return res.json({
            status: 'success',
            message: 'Signup successful'
        });
    } catch (error) {
        console.error(error);
        return res.json({
            status: 'error',
            message: 'An error occurred, please try again'
        });
    }
});

router.post('/login', (req, res) => {
    const {email, password} = req.body;
    if(email == ''|| password == '') {
        res.json({
            status: 'error',
            message: "please enter all fields"
        })
    }else {
        User.find({email})
        .then(data => {
            if(data.length){
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        res.json({
                            status: 'success',
                            message: 'signin successful'
                        })
                    }else{
                        res.json({
                            status: 'error',
                            message: 'invalid password'
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        status: 'error',
                        message: 'password dont match'
                    })
                })
            }else{
                res.json({
                    status: 'error',
                    message: 'invalid credentials'
                })
            }
        })
        .catch(err => {
            res.json({
                status: 'error', 
                message: 'error occurred while checking user'
            })
        })
    }
});
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ status: 'error', message: 'No account with that email found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `https://login.nicholasdiraddo.ca/user/reset-password/${token}`;
    const mailOptions = {
        from: 'nicholasdiraddo@gmail.com',
        to: user.email,
        subject: 'Password Reset Request',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
              `Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n` +
              `${resetUrl}\n\n` +
              `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.error(error);
            return res.json({ status: 'error', message: 'Error sending the email, try again later' });
        }
        res.json({ status: 'success', message: 'An email has been sent with password reset instructions' });
    });
});



router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body; 

    try {
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }  
        });

        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Password reset token is invalid or has expired' });
        }

       
        const hashedPassword = await bcrypt.hash(newPassword, 10); 
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.json({ status: 'success', message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'An error occurred while resetting the password' });
    }
});


router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    res.sendFile(path.join(__dirname, './../public/reset-password.html'), { token });
});

module.exports = router;