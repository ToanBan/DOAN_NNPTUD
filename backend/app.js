require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
let cors = require('cors');
let mongoose = require('mongoose');
const passport = require("passport");
require("./config/passport")
const seedRoles = require('./seed/role.seed');
var authRouter = require('./routes/auth');
var postRouter = require("./routes/post");

var app = express(); 
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use("/api/posts", postRouter);

mongoose.connect("mongodb://127.0.0.1:27020/DOAN_NNPTUD");

mongoose.connection.on('connected', async function () {
  console.log("MongoDB connected");

  await seedRoles(); 
});

mongoose.connection.on('disconnected', function () {
  console.log("MongoDB disconnected");
});



app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
