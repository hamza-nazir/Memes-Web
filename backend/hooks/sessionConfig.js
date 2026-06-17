const session = require('express-session');

const sessionConfig = session({
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 
  }
});

module.exports = sessionConfig;