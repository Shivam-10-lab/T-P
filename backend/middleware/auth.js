const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  //const token = req.headers.authorization?.split(' ')[1];
  const token = req.cookies?.admin_token;

    if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
    console.log("Token verified, admin:", decoded.email);
  } catch(err){
    console.log(err);
    res.status(401).json({ message: 'Session expired. Please login again.' });
  }
};