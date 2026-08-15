import SavedOpportunity from '../models/SavedOpportunity.js';

export async function listSaved(req, res, next) {
  try {
    const saved = await SavedOpportunity.find({ user: req.user._id })
      .populate('opportunity')
      .sort('-createdAt');
    res.json({ items: saved });
  } catch (err) {
    next(err);
  }
}

export async function saveOpportunity(req, res, next) {
  try {
    const existing = await SavedOpportunity.findOneAndUpdate(
      { user: req.user._id, opportunity: req.params.opportunityId },
      { $setOnInsert: { status: 'Saved' } },
      { upsert: true, new: true }
    );
    res.status(201).json({ saved: existing });
  } catch (err) {
    next(err);
  }
}

export async function updateSavedStatus(req, res, next) {
  try {
    const { status } = req.body;
    const saved = await SavedOpportunity.findOneAndUpdate(
      { user: req.user._id, opportunity: req.params.opportunityId },
      { status },
      { new: true }
    );
    if (!saved) return res.status(404).json({ message: 'Not found in saved list' });
    res.json({ saved });
  } catch (err) {
    next(err);
  }
}

export async function unsaveOpportunity(req, res, next) {
  try {
    await SavedOpportunity.findOneAndDelete({
      user: req.user._id,
      opportunity: req.params.opportunityId,
    });
    res.json({ message: 'Removed from saved list' });
  } catch (err) {
    next(err);
  }
}
