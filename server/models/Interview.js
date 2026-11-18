const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
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
    scheduledAt: {
      type: Date,
      required: [true, 'Please provide an interview date and time'],
    },
    mode: {
      type: String,
      enum: ['online', 'in-person', 'phone'],
      default: 'online',
    },
    meetingLinkOrLocation: {
      type: String,
      trim: true,
      default: '',
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ student: 1, scheduledAt: -1 });
interviewSchema.index({ employer: 1, scheduledAt: -1 });

module.exports = mongoose.model('Interview', interviewSchema);
