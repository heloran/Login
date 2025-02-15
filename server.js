require('dotenv').config();
if (typeof(PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}
const express = require('express');
const PORT = process.env.PORT || 3000;
const connectDB = require('./config/db');
const userRouter = require('./api/user');
const path = require('path');
const app = express();

//routes
app.use('/user', userRouter)

//static files
app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
});
app.get('/newAccount', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/new.html'))
});
app.get('/forgetPassword', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/forgot.html'))
});

//body parser
const bodyParser = require('express').json
app.use(bodyParser());


//connect to db
connectDB();

//server
if (typeof(PhusionPassenger) !== 'undefined') {
    app.listen('passenger');
} else {
    app.listen(PORT, () => {
        console.log(`Listening on http://localhost:${PORT}`);
    });
}