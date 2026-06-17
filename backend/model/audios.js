

const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
  url: { type: String },
  caption: { type: String },
  fileName: { type: String },
  key: { type: String },
  fileExt: { type: String },
  tags: [{ type: String }],
  downloadCount: { type: Number, default: 0 }, // Add this field
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const Audios = mongoose.model('Audios', audioSchema);
module.exports = Audios;