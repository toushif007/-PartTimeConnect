const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    college: {
      type: String,
      trim: true,
      default: '',
    },
    course: {
      type: String,
      trim: true,
      default: '',
    },
    graduationYear: {
      type: Number,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    resume: {
      filename: { type: String, default: '' },
      originalName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      size: { type: Number, default: 0 },
      uploadDate: { type: Date, default: null },
      path: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching student skills and location
studentProfileSchema.index({ skills: 1, location: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
