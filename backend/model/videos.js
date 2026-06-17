const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  url: { type: String },
  caption: { type: String },
  fileName: { type: String },
  tags: [{ type: String }],
  fileExt: { type: String },
  key: { type: String },
  downloadCount: { type: Number, default: 0 }, // Add this field
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const Videos = mongoose.model('Videos', videoSchema);
module.exports = Videos;