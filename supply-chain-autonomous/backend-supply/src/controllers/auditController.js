const { db } = require('../database/dbClient');

const getAuditLogs = async (req, res, next) => {
  try {
    const { category, limit = 100 } = req.query;
    let logs = await db.getAuditLogs(Number(limit));

    if (category) {
      logs = logs.filter((l) => l.event_category === category);
    }

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs,
};
