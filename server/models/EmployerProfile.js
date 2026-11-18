const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      default: '',
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '1-10',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    companyDescription: {
      type: String,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);
