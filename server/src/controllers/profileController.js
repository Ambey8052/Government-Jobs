import User from '../models/User.js';

const EDITABLE_FIELDS = [
  'name', 'phone', 'dob', 'gender', 'socialCategory', 'isPwd', 'isExServiceman',
  'domicileState', 'education', 'experienceYears', 'skills',
  'preferredCategories', 'preferredStates', 'preferredJobTypes', 'minExpectedSalary',
];

function isProfileComplete(user) {
  return Boolean(
    user.dob &&
    user.gender &&
    user.domicileState &&
    user.education?.length > 0 &&
    user.preferredCategories?.length > 0
  );
}

export async function getProfile(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

export async function updateProfile(req, res, next) {
  try {
    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findById(req.user._id);
    Object.assign(user, updates);
    user.profileComplete = isProfileComplete(user);
    await user.save();

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}
