const jwt = require('jsonwebtoken');
const SECRET = 'Abhishek';
//Function to create token for new registration
function createToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: '1h'});
  }
  
  //Middleware for verify the token
  const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    } 
    else {
      res.sendStatus(401);
    }
  };

  module.exports = {createToken, authenticateJwt};
