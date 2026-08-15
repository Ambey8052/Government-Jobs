import mongoose from 'mongoose';
import {
  CATEGORIES, OPPORTUNITY_TYPES, EDUCATION_LEVELS, STREAMS,
  SOCIAL_CATEGORIES, GENDER_REQUIREMENTS, INDIAN_STATES, JOB_TYPES,
} from '../utils/constants.js';

const eligibilitySchema = new mongoose.Schema(
  {
    minAge: Number,
    maxAge: Number,
    ageRelaxation: {
      OBC: { type: Number, default: 3 },
      SC: { type: Number, default: 5 },
      ST: { type: Number, default: 5 },
      EWS: { type: Number, default: 0 },
      PwD: { type: Number, default: 10 },
      ExServiceman: { type: Number, default: 3 },
    },
    minEducationLevel: { type: String, enum: EDUCATION_LEVELS, required: true },
    allowedStreams: { type: [String], enum: STREAMS, default: ['Any'] },
    minPercentage: Number,
    genderRequirement: { type: String, enum: GENDER_REQUIREMENTS, default: 'Any' },
    eligibleSocialCategories: { type: [String], enum: SOCIAL_CATEGORIES, default: [...SOCIAL_CATEGORIES] },
    domicileStates: { type: [String], enum: INDIAN_STATES, default: ['All India'] },
    minExperienceYears: { type: Number, default: 0 },
    additionalCriteria: String,
  },
  { _id: false }
);

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    type: { type: String, enum: OPPORTUNITY_TYPES, required: true, default: 'Job' },
    jobType: { type: String, enum: JOB_TYPES, default: 'Permanent' },

    description: { type: String, required: true },
    eligibility: { type: eligibilitySchema, required: true },

    salaryMin: Number,
    salaryMax: Number,
    payScaleText: String,

    vacancies: Number,
    applicationStartDate: Date,
    applicationEndDate: { type: Date, required: true },

    officialLink: { type: String, required: true },
    howToApply: String,
    documentsRequired: [String],
    selectionProcess: String,
    tags: [String],

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

opportunitySchema.index({ title: 'text', organization: 'text', tags: 'text', description: 'text' });
opportunitySchema.index({ applicationEndDate: 1 });
opportunitySchema.index({ category: 1, type: 1 });

opportunitySchema.virtual('status').get(function getStatus() {
  const now = new Date();
  if (this.applicationEndDate < now) return 'Closed';
  if (this.applicationStartDate && this.applicationStartDate > now) return 'Upcoming';
  const daysLeft = (this.applicationEndDate - now) / (1000 * 60 * 60 * 24);
  if (daysLeft <= 7) return 'Closing Soon';
  return 'Active';
});

opportunitySchema.set('toJSON', { virtuals: true });
opportunitySchema.set('toObject', { virtuals: true });

export default mongoose.model('Opportunity', opportunitySchema);
