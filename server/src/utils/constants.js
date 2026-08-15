export const CATEGORIES = [
  'Central Government',
  'State Government',
  'PSU',
  'Banking',
  'Railways',
  'Defence',
  'Police',
  'Teaching',
  'Judiciary',
  'Healthcare',
  'Engineering',
  'Scheme',
  'Scholarship',
  'Other',
];

export const OPPORTUNITY_TYPES = ['Job', 'Scheme', 'Scholarship', 'Internship'];

export const EDUCATION_LEVELS = [
  'Below 10th',
  '10th Pass',
  '12th Pass',
  'ITI',
  'Diploma',
  'Graduate',
  'Post Graduate',
  'PhD',
];

export const STREAMS = [
  'Any',
  'Arts',
  'Science',
  'Commerce',
  'Engineering',
  'Medical',
  'Law',
  'Agriculture',
  'Education',
  'Management',
  'Computer Science / IT',
];

export const SOCIAL_CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];

export const GENDERS = ['Male', 'Female', 'Other'];

export const GENDER_REQUIREMENTS = ['Any', 'Male', 'Female', 'Other'];

export const INDIAN_STATES = [
  'All India',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const JOB_TYPES = ['Permanent', 'Contract', 'Internship'];

export const OPPORTUNITY_STATUS = ['Upcoming', 'Active', 'Closing Soon', 'Closed'];

export const EDUCATION_LEVEL_RANK = EDUCATION_LEVELS.reduce((acc, level, i) => {
  acc[level] = i;
  return acc;
}, {});
