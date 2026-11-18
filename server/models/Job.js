const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a job category'],
    },
    jobType: {
      type: String,
      enum: ['part-time', 'internship', 'freelance'],
      default: 'part-time',
    },
    workMode: {
      type: String,
      enum: ['remote', 'on-site', 'hybrid'],
      default: 'remote',
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    stipend: {
      amount: {
        type: Number,
        required: [true, 'Please specify stipend amount'],
        min: [0, 'Stipend cannot be negative'],
      },
      frequency: {
        type: String,
        enum: ['hourly', 'weekly', 'monthly', 'fixed'],
        default: 'monthly',
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
    },
    vacancies: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 vacancy is required'],
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Search & performance indexes
jobSchema.index({ title: 'text', description: 'text', location: 'text' });
jobSchema.index({ category: 1, status: 1, createdAt: -1 });
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ 'stipend.amount': 1 });
jobSchema.index({ workMode: 1, jobType: 1 });

module.exports = mongoose.model('Job', jobSchema);
