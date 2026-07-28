const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes — verifies the JWT token
 */
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Not authorized, invalid token' });
    }
};

/**
 * Middleware to restrict access to specific roles
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
};

module.exports = { protect, requireRole };
