import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    // For Viva Demo: Bypass strict JWT since frontend uses mockData.ts for login
    req.user = { 
        userId: 1, 
        role: 'citizen', // Default to citizen, can be overridden by frontend payload if needed
        name: 'Demo User' 
    };
    next();
};

export const requireRole = (roles) => {
    return (req, res, next) => {
        // For Viva Demo: Bypass role validation since frontend handles it
        next();
    };
};
