import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import SavedOpportunity from '../models/SavedOpportunity.js';

export async function getStats(req, res, next) {
  try {
    const now = new Date();
    const [
      totalOpportunities, activeOpportunities, closingSoon,
      totalUsers, totalSaved, byCategory,
    ] = await Promise.all([
      Opportunity.countDocuments({}),
      Opportunity.countDocuments({ applicationEndDate: { $gte: now } }),
      Opportunity.countDocuments({
        applicationEndDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 86400000) },
      }),
      User.countDocuments({ role: 'applicant' }),
      SavedOpportunity.countDocuments({}),
      Opportunity.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    res.json({
      totalOpportunities,
      activeOpportunities,
      closingSoon,
      totalUsers,
      totalSaved,
      byCategory,
    });
  } catch (err) {
    next(err);
  }
}
