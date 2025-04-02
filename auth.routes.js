const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('./user.model');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'demo_node+mongo_token';

// POST /auth/register  toujours passer les inputs user au sanitize()
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Crée un nouvel utilisateur.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom d'utilisateur.
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur.
 *                 example: password123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *       400:
 *         description: Erreurs de validation.
 *       500:
 *         description: Erreur système.
 */
router.post('/register', [
    body('name').trim().escape()
      .notEmpty().withMessage('Le nom d’utilisateur est requis.')
      .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
    body('password').trim()
      .notEmpty().withMessage('Le mot de passe est requis.')
      .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
  ], async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, password } = req.body;

    try {
        const user = new User({ name, password });
        await user.save();
        res.status(201).json({ message: 'Utilisateur créé' });
      } catch (err) {
        if (err.code === 11000) return res.status(500).json({ error: 'Erreur système' });
        res.status(400).json({ error: err.message });
      }
  });

// POST /auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connecte un utilisateur.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom d'utilisateur.
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur.
 *                 example: password123
 *     responses:
 *       200:
 *         description: Connecté avec succès. Un cookie contenant le token JWT est renvoyé.
 *         headers:
 *           Set-Cookie:
 *             description: Cookie contenant le token JWT.
 *             schema:
 *               type: string
 *       401:
 *         description: Identifiants invalides.
 */
router.post('/login', async (req, res) => {
    // toujours passer les inputs user au sanitize()
    const name = req.bodyString('name');
    const password = req.bodyString('password');
    const user = await User.findOne({ name });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
  
    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
  
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });
  
    res.json({ message: 'Connecté avec succès' });
  });

// GET /auth/logout
/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Déconnecte un utilisateur.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Déconnecté avec succès.
 */
router.get('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: 'Déconnecté' });
});

module.exports = router;