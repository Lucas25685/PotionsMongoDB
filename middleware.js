const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'demo_node+mongo_token';

function authMiddleware(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  // Vérification de présence et format du token
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return res.status(401).json({ error: 'Token d’authentification manquant ou invalide' });
  }

  // Vérification du token JWT
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Jeton non valide.' });
    }
    return res.status(500).json({ error: 'Erreur d’authentification' });
  }
}

module.exports = authMiddleware;