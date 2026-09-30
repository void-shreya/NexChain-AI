const { db } = require('../database/dbClient');

const getDecisions = async (req, res, next) => {
  try {
    const decisions = await db.getDecisions();
    res.json({ success: true, count: decisions.length, data: decisions });
  } catch (err) {
    next(err);
  }
};

const getDecisionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const decision = await db.getDecisionById(id);
    if (!decision) {
      return res.status(404).json({ success: false, error: 'Decision record not found' });
    }
    res.json({ success: true, data: decision });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDecisions,
  getDecisionById,
};
