const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview_scheduled', 'rejected', 'hired', 'withdrawn'],
      default: 'applied',
    },
    coverNote: {
      type: String,
      trim: true,
      default: '',
    },
    resumeSnapshot: {
      filename: { type: String, default: '' },
      originalName: { type: String, default: '' },
      path: { type: String, default: '' },
      mimeType: { type: String, default: '' },
    },
    timeline: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee a student cannot apply twice to the same job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
