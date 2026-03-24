require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

let mongoose = require('mongoose');

var usersRouter = require('./routes/users');

var app = express(); 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/users', usersRouter);

mongoose.connect('mongodb://127.0.0.1:27017/DOAN_NNPTUD');

mongoose.connection.on('connected', function () {
  console.log("MongoDB connected");
});

mongoose.connection.on('disconnected', function () {
  console.log("MongoDB disconnected");
});



app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});