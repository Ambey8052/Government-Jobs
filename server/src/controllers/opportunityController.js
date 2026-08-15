import Opportunity from '../models/Opportunity.js';
import { parseSearchQuery } from '../services/geminiService.js';
import { EDUCATION_LEVELS, EDUCATION_LEVEL_RANK } from '../utils/constants.js';

export async function listOpportunities(req, res, next) {
  try {
    const {
      category, type, state, search, status,
      page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const query = { isPublished: true };
    const interpreted = search ? await parseSearchQuery(search) : null;

    if (interpreted) query.$text = { $search: interpreted.keywords };
    if (category || interpreted?.category) query.category = category || interpreted.category;
    if (type || interpreted?.type) query.type = type || interpreted.type;

    const effectiveState = state || interpreted?.state;
    if (effectiveState) query['eligibility.domicileStates'] = { $in: [effectiveState, 'All India'] };

    if (interpreted?.minEducationLevel) {
      const rank = EDUCATION_LEVEL_RANK[interpreted.minEducationLevel];
      query['eligibility.minEducationLevel'] = {
        $in: EDUCATION_LEVELS.filter((l) => EDUCATION_LEVEL_RANK[l] <= rank),
      };
    }
    if (interpreted?.gender && interpreted.gender !== 'Any') {
      query['eligibility.genderRequirement'] = { $in: [interpreted.gender, 'Any'] };
    }

    if (status === 'Closed') {
      query.applicationEndDate = { $lt: new Date() };
    } else if (status && status !== 'Closed') {
      query.applicationEndDate = { $gte: new Date() };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

    const [items, total] = await Promise.all([
      Opportunity.find(query)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Opportunity.countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      interpreted,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
}

export async function createOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ opportunity });
  } catch (err) {
    next(err);
  }
}

export async function updateOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
}

export async function deleteOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json({ message: 'Opportunity deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listOpportunitiesAdmin(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [items, total] = await Promise.all([
      Opportunity.find({})
        .sort('-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Opportunity.countDocuments({}),
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}
