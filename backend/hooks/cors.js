const cors = require('cors');

const corsSetup = cors({
  origin: process.env.FRONT_END,
  credentials: true
});

module.exports = corsSetup;