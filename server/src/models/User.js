import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  EDUCATION_LEVELS, STREAMS, SOCIAL_CATEGORIES, GENDERS,
  INDIAN_STATES, CATEGORIES, JOB_TYPES, EDUCATION_LEVEL_RANK,
} from '../utils/constants.js';

const educationSchema = new mongoose.Schema(
  {
    level: { type: String, enum: EDUCATION_LEVELS, required: true },
    stream: { type: String, enum: STREAMS, default: 'Any' },
    yearOfCompletion: Number,
    percentage: Number,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['applicant', 'admin'], default: 'applicant' },

    // Personal details
    dob: Date,
    gender: { type: String, enum: GENDERS },
    socialCategory: { type: String, enum: SOCIAL_CATEGORIES, default: 'General' },
    isPwd: { type: Boolean, default: false },
    isExServiceman: { type: Boolean, default: false },
    domicileState: { type: String, enum: INDIAN_STATES },

    // Education (highest qualification kept first by convention, but store all)
    education: [educationSchema],
    experienceYears: { type: Number, default: 0 },
    skills: [String],

    // Preferences
    preferredCategories: [{ type: String, enum: CATEGORIES }],
    preferredStates: [{ type: String, enum: INDIAN_STATES }],
    preferredJobTypes: [{ type: String, enum: JOB_TYPES }],
    minExpectedSalary: Number,

    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.highestEducation = function highestEducation() {
  if (!this.education || this.education.length === 0) return null;
  return this.education.reduce((best, cur) =>
    EDUCATION_LEVEL_RANK[cur.level] > EDUCATION_LEVEL_RANK[best.level] ? cur : best
  );
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
