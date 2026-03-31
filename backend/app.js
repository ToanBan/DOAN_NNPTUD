require('dotenv').config({ path: ['.env.local', '.env'] });
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
var usersRouter = require('./routes/users');

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
app.use('/api/users', usersRouter);

mongoose.connect(
  'mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/DOAN_NNPTUD?replicaSet=rs0'
);

mongoose.connection.on('connected', async function () {
  console.log("MongoDB connected");

  await seedRoles(); 
});

mongoose.connection.on('disconnected', function () {
  console.log("MongoDB disconnected");
});


const http = require('http');
const server = http.createServer(app);
const socketUtil = require('./utils/socket');
socketUtil.init(server);

server.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});