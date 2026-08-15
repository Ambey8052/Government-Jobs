import Opportunity from '../models/Opportunity.js';
import { rankOpportunities, evaluateMatch } from '../services/matchingEngine.js';
import { parseSearchQuery } from '../services/geminiService.js';

export async function getMatches(req, res, next) {
  try {
    const { category, type, minScore = 0, eligibleOnly, search } = req.query;

    const query = { isPublished: true, applicationEndDate: { $gte: new Date() } };
    const interpreted = search ? await parseSearchQuery(search) : null;

    if (interpreted) query.$text = { $search: interpreted.keywords };
    if (category || interpreted?.category) query.category = category || interpreted.category;
    if (type || interpreted?.type) query.type = type || interpreted.type;

    const opportunities = await Opportunity.find(query);
    let ranked = rankOpportunities(req.user, opportunities);

    if (eligibleOnly === 'true') ranked = ranked.filter((o) => o.match.eligible);
    if (minScore) ranked = ranked.filter((o) => o.match.score >= Number(minScore));

    res.json({ items: ranked, total: ranked.length, interpreted });
  } catch (err) {
    next(err);
  }
}

export async function getMatchDetail(req, res, next) {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    const match = evaluateMatch(req.user, opportunity.toObject({ virtuals: true }));
    res.json({ opportunity, match });
  } catch (err) {
    next(err);
  }
}
