const mongoose = require('mongoose');

const jobReportSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      enum: ['fraud', 'inappropriate_content', 'incorrect_information', 'scam', 'other'],
      default: 'other',
    },
    details: {
      type: String,
      required: [true, 'Please explain reason for reporting this job'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
      default: 'pending',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

jobReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('JobReport', jobReportSchema);
