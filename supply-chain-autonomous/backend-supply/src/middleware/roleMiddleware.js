const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. User context missing.' });
    }

    // System ADMIN always has full clearance for all operational and administrative actions
    if (req.user.role_id === 'ADMIN' || allowedRoles.includes(req.user.role_id)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Forbidden. Role '${req.user.role_id}' lacks permission for this action. Allowed: ${allowedRoles.join(', ')}`,
    });
  };
};

module.exports = {
  authorize,
};
