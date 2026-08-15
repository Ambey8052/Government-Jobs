import { EDUCATION_LEVEL_RANK } from '../utils/constants.js';

const RELAXATION_KEY_BY_CATEGORY = { OBC: 'OBC', SC: 'SC', ST: 'ST', EWS: 'EWS' };

function getAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function getEffectiveMaxAge(eligibility, user) {
  let relaxation = 0;
  const catKey = RELAXATION_KEY_BY_CATEGORY[user.socialCategory];
  if (catKey && eligibility.ageRelaxation?.[catKey]) {
    relaxation = Math.max(relaxation, eligibility.ageRelaxation[catKey]);
  }
  if (user.isPwd && eligibility.ageRelaxation?.PwD) {
    relaxation = Math.max(relaxation, eligibility.ageRelaxation.PwD);
  }
  if (user.isExServiceman && eligibility.ageRelaxation?.ExServiceman) {
    relaxation = Math.max(relaxation, eligibility.ageRelaxation.ExServiceman);
  }
  return (eligibility.maxAge ?? Infinity) + relaxation;
}

/**
 * Evaluates a user against one opportunity's eligibility criteria.
 * Returns { eligible, reasons[], score (0-100), breakdown{} }.
 * Hard filters (age, gender, category reservation, domicile, min education)
 * make eligible=false and cap the score low; soft factors produce the 0-100 score.
 */
export function evaluateMatch(user, opportunity) {
  const { eligibility } = opportunity;
  const reasons = [];
  let eligible = true;

  // ---- Hard filters ----
  const age = getAge(user.dob);
  if (age != null && eligibility.minAge != null && age < eligibility.minAge) {
    eligible = false;
    reasons.push(`Minimum age required is ${eligibility.minAge}; you are ${age}`);
  }
  if (age != null && eligibility.maxAge != null) {
    const effectiveMax = getEffectiveMaxAge(eligibility, user);
    if (age > effectiveMax) {
      eligible = false;
      reasons.push(`Maximum age (with applicable relaxation) is ${effectiveMax}; you are ${age}`);
    }
  }

  if (eligibility.genderRequirement && eligibility.genderRequirement !== 'Any') {
    if (user.gender && user.gender !== eligibility.genderRequirement) {
      eligible = false;
      reasons.push(`Open to ${eligibility.genderRequirement} candidates only`);
    }
  }

  if (eligibility.eligibleSocialCategories?.length) {
    const allCategoriesAllowed = eligibility.eligibleSocialCategories.length >= 5;
    if (!allCategoriesAllowed && !eligibility.eligibleSocialCategories.includes(user.socialCategory)) {
      eligible = false;
      reasons.push(`Reserved for categories: ${eligibility.eligibleSocialCategories.join(', ')}`);
    }
  }

  if (eligibility.domicileStates?.length && !eligibility.domicileStates.includes('All India')) {
    if (user.domicileState && !eligibility.domicileStates.includes(user.domicileState)) {
      eligible = false;
      reasons.push(`Open only to domiciles of: ${eligibility.domicileStates.join(', ')}`);
    }
  }

  const highestEdu = user.education?.length
    ? user.education.reduce((best, cur) =>
        EDUCATION_LEVEL_RANK[cur.level] > EDUCATION_LEVEL_RANK[best.level] ? cur : best)
    : null;

  const requiredEduRank = EDUCATION_LEVEL_RANK[eligibility.minEducationLevel] ?? 0;
  const userEduRank = highestEdu ? EDUCATION_LEVEL_RANK[highestEdu.level] : -1;
  if (userEduRank < requiredEduRank) {
    eligible = false;
    reasons.push(`Minimum education required: ${eligibility.minEducationLevel}`);
  }

  if (eligibility.minExperienceYears > 0 && user.experienceYears < eligibility.minExperienceYears) {
    eligible = false;
    reasons.push(`Requires ${eligibility.minExperienceYears}+ years of experience`);
  }

  // ---- Soft scoring (weights sum to 100) ----
  const breakdown = {};

  // Education level fit (25)
  if (userEduRank >= requiredEduRank && requiredEduRank >= 0) {
    breakdown.education = userEduRank === requiredEduRank ? 25 : 22;
  } else {
    breakdown.education = 0;
  }

  // Stream/field fit (15)
  const allowedStreams = eligibility.allowedStreams?.length ? eligibility.allowedStreams : ['Any'];
  if (allowedStreams.includes('Any') || !highestEdu?.stream) {
    breakdown.stream = 12;
  } else {
    breakdown.stream = allowedStreams.includes(highestEdu.stream) ? 15 : 4;
  }

  // Experience fit (15)
  if (!eligibility.minExperienceYears) {
    breakdown.experience = user.experienceYears > 0 ? 15 : 12;
  } else {
    breakdown.experience = user.experienceYears >= eligibility.minExperienceYears ? 15 : 0;
  }

  // Category/sector preference match (20)
  breakdown.categoryPreference = user.preferredCategories?.includes(opportunity.category) ? 20 : 6;

  // Location preference match (15)
  const oppStates = eligibility.domicileStates?.length ? eligibility.domicileStates : ['All India'];
  const userStates = user.preferredStates?.length ? user.preferredStates : [];
  if (oppStates.includes('All India')) {
    breakdown.location = userStates.includes('All India') || userStates.length === 0 ? 12 : 15;
  } else {
    breakdown.location = oppStates.some((s) => userStates.includes(s)) ? 15 : 5;
  }

  // Percentage / cutoff fit (10)
  if (eligibility.minPercentage && highestEdu?.percentage != null) {
    breakdown.percentage = highestEdu.percentage >= eligibility.minPercentage ? 10 : 0;
  } else {
    breakdown.percentage = 8;
  }

  let score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (!eligible) {
    score = Math.min(score, 30);
  }

  return { eligible, reasons, score, breakdown, age };
}

export function rankOpportunities(user, opportunities) {
  return opportunities
    .map((opp) => {
      const oppObj = opp.toObject ? opp.toObject({ virtuals: true }) : opp;
      const match = evaluateMatch(user, oppObj);
      return { ...oppObj, match };
    })
    .sort((a, b) => b.match.score - a.match.score);
}
