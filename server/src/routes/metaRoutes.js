import { Router } from 'express';
import {
  CATEGORIES, OPPORTUNITY_TYPES, EDUCATION_LEVELS, STREAMS,
  SOCIAL_CATEGORIES, GENDERS, GENDER_REQUIREMENTS, INDIAN_STATES, JOB_TYPES,
} from '../utils/constants.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    categories: CATEGORIES,
    opportunityTypes: OPPORTUNITY_TYPES,
    educationLevels: EDUCATION_LEVELS,
    streams: STREAMS,
    socialCategories: SOCIAL_CATEGORIES,
    genders: GENDERS,
    genderRequirements: GENDER_REQUIREMENTS,
    states: INDIAN_STATES,
    jobTypes: JOB_TYPES,
  });
});

export default router;
