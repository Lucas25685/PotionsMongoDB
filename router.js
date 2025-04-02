const express = require('express');
const router = express.Router();
const Potion = require('./potion.model');
const authMiddleware = require('./middleware');

// GET /potions : lire toutes les potions
/**
 * @swagger
 * /potions:
 *   get:
 *     summary: Récupère toutes les potions.
 *     tags:
 *       - Potions
 *     responses:
 *       200:
 *         description: Liste des potions.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/', async (req, res) => {
    try {
      const potions = await Potion.find();
      res.json(potions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// GET /names : récupérer uniquement les noms de toutes les potions
/**
 * @swagger
 * /potions/names:
 *   get:
 *     summary: Récupère uniquement les noms des potions.
 *     tags:
 *       - Potions
 *     responses:
 *       200:
 *         description: Liste des noms des potions.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/names', async (req, res) => {
    try {
        const names = await Potion.find({}, 'name'); // On ne sélectionne que le champ 'name'
        res.json(names.map(p => p.name)); // renvoyer juste un tableau de strings
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /potions/vendor/:vendor_id : toutes les potions d’un vendeur
/**
 * @swagger
 * /potions/vendor/{vendor_id}:
 *   get:
 *     summary: Récupère toutes les potions d’un vendeur.
 *     tags:
 *       - Potions
 *     parameters:
 *       - in: path
 *         name: vendor_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du vendeur.
 *     responses:
 *       200:
 *         description: Liste des potions du vendeur.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/vendor/:vendor_id', async (req, res) => {
    try {
        const vendorId = req.params.vendor_id;
        const potions = await Potion.find({ vendor_id: vendorId });
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /potions/price-range?min=X&max=Y : potions entre min et max
/**
 * @swagger
 * /potions/price-range:
 *   get:
 *     summary: Récupère les potions dans une plage de prix.
 *     tags:
 *       - Potions
 *     parameters:
 *       - in: query
 *         name: min
 *         required: true
 *         schema:
 *           type: number
 *         description: Prix minimum.
 *       - in: query
 *         name: max
 *         required: true
 *         schema:
 *           type: number
 *         description: Prix maximum.
 *     responses:
 *       200:
 *         description: Liste des potions dans la plage de prix.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/price-range', async (req, res) => {
    try {
        const { min, max } = req.query;
        const potions = await Potion.find({ price: { $gte: parseFloat(min), $lte: parseFloat(max) } });
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/distinct-categories : nombre total de catégories différentes
/**
 * @swagger
 * /potions/analytics/distinct-categories:
 *   get:
 *     summary: Récupère le nombre total de catégories différentes.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Nombre total de catégories différentes.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/distinct-categories', async (req, res) => {
    try {
        const categories = await Potion.distinct('categories');
        res.json({ distinctCategories: categories.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/average-score-by-vendor : score moyen des vendeurs
/**
 * @swagger
 * /potions/analytics/average-score-by-vendor:
 *   get:
 *     summary: Récupère le score moyen des vendeurs.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Score moyen des vendeurs.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/average-score-by-vendor', async (req, res) => {
    try {
        const result = await Potion.aggregate([
            { $group: { _id: "$vendor_id", averageScore: { $avg: "$score" } } }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/average-score-by-category : score moyen des catégories
/**
 * @swagger
 * /potions/analytics/average-score-by-category:
 *   get:
 *     summary: Récupère le score moyen des catégories.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Score moyen des catégories.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/average-score-by-category', async (req, res) => {
    try {
        const result = await Potion.aggregate([
            { $unwind: "$categories" },
            { $group: { _id: "$categories", averageScore: { $avg: "$score" } } }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/strength-flavor-ratio : ratio entre force et parfum des potions
/**
 * @swagger
 * /potions/analytics/strength-flavor-ratio:
 *   get:
 *     summary: Récupère le ratio entre force et parfum des potions.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Ratio entre force et parfum des potions.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/strength-flavor-ratio', async (req, res) => {
    try {
        const result = await Potion.aggregate([
            { $project: { _id: 0, name: 1, ratio: { $divide: ["$ratings.strength", "$ratings.flavor"] } } }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/search : recherche avec 3 paramètres
/**
 * @swagger
 * /potions/analytics/search:
 *   get:
 *     summary: Recherche avec 3 paramètres.
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         required: true
 *         schema:
 *           type: string
 *         description: Champ pour regrouper les résultats.
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *         description: Métrique à appliquer (avg, sum, count).
 *       - in: query
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *         description: Champ sur lequel appliquer la métrique.
 *     responses:
 *       200:
 *         description: Résultats de la recherche.
 *       400:
 *         description: Paramètres manquants.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/analytics/search', async (req, res) => {
    try {
        const { groupBy, metric, field } = req.query;

        if (!groupBy || !metric || !field) {
            return res.status(400).json({ error: "Missing required query parameters: groupBy, metric, field" });
        }

        const aggregation = [
            { $group: { _id: `$${groupBy}`, [metric]: { [`$${metric}`]: `$${field}` } } }
        ];

        const result = await Potion.aggregate(aggregation);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /potions : créer une nouvelle potion
/**
 * @swagger
 * /potions:
 *   post:
 *     summary: Crée une nouvelle potion.
 *     tags:
 *       - Potions
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la potion.
 *               price:
 *                 type: number
 *                 description: Prix de la potion.
 *               score:
 *                 type: number
 *                 description: Score de la potion.
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Ingrédients de la potion.
 *               ratings:
 *                 type: object
 *                 properties:
 *                   strength:
 *                     type: number
 *                   flavor:
 *                     type: number
 *               tryDate:
 *                 type: string
 *                 format: date
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               vendor_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Potion créée avec succès.
 *       400:
 *         description: Erreur de validation.
 *       500:
 *         description: Erreur serveur.
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newPotion = new Potion(req.body);
        const savedPotion = await newPotion.save();
        res.status(201).json(savedPotion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;