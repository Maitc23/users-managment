const jwt = require('jsonwebtoken');
const config = require('../config/config.jwt');


//Middleware that verifies the token
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers['user-access-token'];
        if (!token) {
            return res.status(401).json({
                auth: false,
                message: 'INVALID AUTHORIZATION'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || config.secret);
        
        if (!decoded) {
            return res.status(401).json({
                auth: false,
                message: 'INVALID AUTHORIZATION'
            });
        }
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = verifyToken;