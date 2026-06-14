import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Spring Boot signs claims with:
    // claims.put("userId", id);
    // claims.put("role", role);
    // and standard "sub" for username (email)
    
    req.user = {
      id: decoded.userId,
      email: decoded.sub,
      role: decoded.role
    };
    
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ message: 'Admin role required' });
    }
  });
};
