const mongoose = require('mongoose');

const connection = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/MemesCollection');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connection;