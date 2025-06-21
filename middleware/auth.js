const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }
};

exports.orgAdmin = async (req, res, next) => {
  const org = await Organization.findById(req.params.orgId || req.body.organization);
  
  const member = org.members.find(m => 
    m.user.toString() === req.user._id.toString() && m.role === 'admin'
  );

  if (!member) {
    return res.status(403).json({ 
      success: false, 
      error: 'Not authorized as organization admin' 
    });
  }

  next();
};