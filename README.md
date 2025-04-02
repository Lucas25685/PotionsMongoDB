## Démarrer le projet

### 1. Cloner le dépôt
Clonez le dépôt sur votre machine locale :
```sh
git clone <URL_DU_DEPOT>
cd MongoDB
```

### 2. Installer les dépendances
Installez les dépendances nécessaires avec npm :
```sh
npm install
```

### 3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet et ajoutez les variables suivantes :
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/esgi
JWT_SECRET=your_jwt_secret
```

### 4. Lancer MongoDB
Assurez-vous que MongoDB est en cours d'exécution sur votre machine. Si ce n'est pas le cas, démarrez MongoDB :
```sh
mongod
```

### 5. Démarrer le serveur
Lancez le serveur en mode développement avec nodemon :
```sh
npm run dev
```

### 6. Accéder à l'API
Ouvrez votre navigateur et accédez à l'URL suivante pour voir la documentation Swagger :
```
http://localhost:3000/api-docs
```

# nodeJS et mongoDB
Cours de nodeJS et mongoDB, par Nicolas Hersant - Galactic Robots, pour ESGI.

## Pré-requis
[Installation de mongoDB community](https://www.mongodb.com/docs/manual/installation/)  
[Installation de node avec NVM](https://nodejs.org/en/download)


***
```sh
npm init
npm install -g nodemon
npm install express
```

## créer server.js
```javascript
const http = require('http');
const app = require('./app');

// renvoi un port valide
const normalizePort = val => {
	const port = parseInt(val, 10);

	if (isNaN(port)) return val;
	if (port >= 0) return port;
	return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// gestion des retours d'erreurs
const errorHandler = error => {
    if (error.syscall !== 'listen') throw error;
  
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

	if (error.code === 'EACCES'){
		console.error(bind + ' requires elevated privileges.');
		process.exit(1);
	}

	if (error.code === 'EADDRINUSE') {
		console.error(bind + ' is already in use.');
		process.exit(1);
	}

	throw error;
};

const server = http.createServer(app);
server.on('error', errorHandler);
server.on('listening', () => {
	const address = server.address();
	const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
	console.log('Listening on ' + bind);
});

server.listen(port);
```

On gére le routing depuis app.js
```javascript
const express = require('express');

const app = express();
app.use((req, res) => {
   res.status(200).json({ message: 'Votre requête a bien été reçue !' }); 
});

module.exports = app;
```

## démarrer le server en mode watch
```sh
nodemon server.js
```  
go http://localhost:3000  
Pour une utilisation plus standard, on va modifier package.json :  
```js
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
```  
de cette manière on lance l'application avec 
```sh
npm run dev
```  
A présent notre server nodeJS local est disponible, passons à la BDD


## Lancer le shell mongo
```sh
mongosh
```
Lister les bases et créer une nouvelle
```sh
show dbs
use esgi
show collections
```
## mongoDB : Les collections 
La création de collection peut être explicite ou implicite selon le principe find or create.
```js
db.createCollection('movies')
db.heroes.insertMany([{"FirstName": "Bruce", "LastName": "Wayne", "Email": "bwayne@Wayneenterprises.com"},{"FirstName": "Tony", "LastName": "Stark", "Email": "stronger@avengers.com"}])
db.heroes.find()
db.heroes.drop()
exit
mongoimport --db esgi --collection movies --file movies.json
mongosh
```

Ouvrir le PDF "The Magical Marvels Of MondoDB" pour la suie du cours.

## mongoDB : les requêtes de base : CRUD
Create
```js
db.potions.insertOne({"name": "Invisibility", "vendor": "Kettlecooked"})
db.potions.insertMany([{"name": "Love", "vendor": "Brewers"}, {"name": "Shrinking", "vendor": "Kettlecooked"}])
db.potions.find()
```
Read
```js
db.potions.find()
db.potions.find({"name": "Invisibility"})
db.potions.find({"name": "Invisibility"}, {"name": true})
db.potions.find({"vendor": "Kettlecooked"})
db.potions.find({"name": { $regex: "in" }})
db.potions.find({"name": { $regex: "in", $options: "i"}})
```
Update
```js
db.potions.find()
db.potions.find().count()
db.potions.updateOne({"name": "Invisibility"}, { $set: { "color": "bleu", "price": 10.99, "score": 59, "count": 1 }})
db.potions.updateMany({}, { $set: { "ingredients": [] }}).
db.potions.updateOne({"name": "Invisibility"}, { $set: { "tryDate": new Date(2025,4,1) }})
db.potions.updateMany({"name": "Invisibility"}, { $set: { "tryDate": new Date() }})
db.potions.updateOne({"name": "Invisibility"}, { $set: { "ingredients": ["newt toes", 42, "laughter"], "category": ["tasty", "effective"] }})
db.potions.updateOne({"name": "Invisibility"}, { $set: { "ratings": {"strength": 2, "flavor": 5} }})
db.potions.updateOne({"name": "Invisibility"}, { $set: { "ratings.strength": 1 } })
db.potions.updateOne({"name": "Invisibility"}, { $inc: { "count": 1 }})
db.potions.updateOne({"name": "Love"}, { $set: { "ratings": {"strength": 2, "flavor": 5}, "ingredients": ["hair","water"], "category": ["tasty", "slow", "temporary"], "tryDate": new Date()}})
```
Read valeurs imbriquées :  
mongo peut rechercher directement une valeur dans un tableau ou rechercher dans les objets imbriqués via l'opérateur .
```js
db.potions.find({"ingredients":42})
db.potions.find({"ratings.flavor":5})
```
Delete
```js
db.potions.deleteOne({"name": "Love"})
db.potions.deleteMany({"ratings.flavor":5})
```
exercice :  
Implémentez votre base avec des données homogènes pour chaque potions, inventez les données manquantes.
(tryDate, ingredients, color, ratings, vendor, count)
```js
db.potions.updateMany({}, { $set: { "ingredients": [], "tryDate": new Date(2025,4,1),  }}).
```

## mongoDB : manipulations courantes 

retirer le champ color de la collection
```js
db.potions.updateMany({},{ $unset: {"color"}})
```
modifier une clef 
```js
db.potions.updateMany({},{ $rename: {"category": "categories"}})
```
compter le nmbre d'occurence d'une valeur dans les champs tableau de la collection
```js
db.potions.countDocuments({ categories: "effective" })
```
écraser un tableau 
```js
db.potions.updateOne({"name": "Invisibility"}, { $set: { "ingredients": "secret" }})
```
mettre à jour une seule valeur d'un tableau avec son index
```js
db.potions.updateOne({"name": "Invisibility"}, { $set: { "ingredients": ["newt toes", 42, "laughter"] }})
db.potions.updateOne({"name": "Invisibility"}, { $set: { "ingredients.1": "secret" }})
db.potions.find({"name": "Invisibility"})
```
mettre à jour une seule valeur d'un tableau avec un résultat de selection
```js
db.potions.updateMany({"ingredients": "secret"}, { $set: { "ingredients.$": 42 }})
db.potions.find({"name": "Invisibility"})
```
retirer la première ou dernière valeur d'un tableau
```js
db.potions.updateOne({"name": "Invisibility"}, { $pop: { "categories": 1 }}) // last
db.potions.updateOne({"name": "Invisibility"}, { $pop: { "categories": -1 }}) // first
```
ajouter une valeur en fin de tableau
```js
db.potions.updateOne({"name": "Invisibility"}, { $push: { "categories": "budget" }})
db.potions.updateOne({"name": "Invisibility"}, { $push: { "categories": "budget" }})
db.potions.find({"name": "Invisibility"})
db.potions.updateOne({"name": "Invisibility"}, { $pull: { "categories": "budget" }})
db.potions.updateOne({"name": "Invisibility"}, { $push: { "categories": "budget" }})
db.potions.updateMany({}, { $addToSet: { "categories": "budget" }})
db.potions.find()
```
recherche par opérateurs de grandeur
```js
db.potions.find({"price": {$lt: 10}})
db.potions.find({"price": {$gt: 10}})
db.potions.find({"price": {$lte: 20, $gte: 10}})
db.potions.find({"vendor": {$ne: "Brewers"}})
db.potions.find({"categories": {$elemMatch: {$ne: "budget"}}})
```
exclure certains champs d'une selection
```js
db.potions.find({"price": {$lt: 10}}, {"ratings": false, "_id": false})
```
tri des résultats d'une selection (1: croissant, -1: décroissant)
```js
db.potions.find().sort({"price": 1})
db.potions.find().sort({"price": -1})
db.potions.find().sort({"price": -1}).limit(2)
db.potions.find().sort({"price": -1}).skip(1).limit(2)
```

## mongoDB : intégrité des données

Modifions la base pour transformer le champ vendeurs en objet afin d'enregistrer les coordonnées du vendeur 
```js
db.potions.updateMany({"vendor.name": "Kettlecooked"}, {$set: {"vendor_id" : "Kettlecooked"}}})
db.potions.updateMany({"vendor": "Brewers"}, {$set: {"vendor" : {"name": "Brewers", "organic": false}}})
db.potions.find()
db.potions.updateOne({"name": "Invisibility"}, {$set: {"vendor" : {"name": "Kettlecooked", "organic":  false}}})
```
dans le cas présent, on a une inconsistance des données, on peut factoriser les vendeurs dans une collection dédiée.
les noms des vendeurs sont uniques et seront utilisés comme ID
```js
db.vendors.insertMany([{"_id": "Kettlecooked", "organic":  true}, {"_id": "Brewers", "organic": false}, {"_id": "Leprechaun", "organic": true}])
db.potions.updateMany({"vendor.name": "Kettlecooked"}, {$set: {"vendor_id" : "Kettlecooked"}, $unset: {"vendor":""}})
db.potions.updateMany({"vendor.name": "Brewers"}, {$set: {"vendor_id" : "Brewers"}, $unset: {"vendor":""}})
```
A partir de ce moment, comment maintenir l'intégrité des données dans le temps ? Les Aggregats
```js
db.vendors.insertMany([{ "_id": "Mystic Waters", "organic": true }, { "_id": "Draconic IPA", "organic": false }])
db.potions.insertMany(
   [
      {
         "name": "Healing",
         "ingredients": ["ginseng", "unicorn tear"],
         "categories": ["effective", "premium"],
         "ratings": { "strength": 2, "flavor": 1 },
         "price": 25.5,
         "score": 50,
         "vendor_id": "Mystic Waters"
      },
      {
         "name": "Fire Breath",
         "ingredients": ["dragon scale powder", "spicy chili essence"],
         "categories": ["dangerous", "premium"],
         "ratings": { "strength": 5, "flavor": 1 },
         "price": 45.99,
         "score": 90,
         "vendor_id": "Draconic IPA"
      },
      {
         "name": "Water Walking",
         "ingredients": ["mermaid scale", "lotus nectar"],
         "categories": ["rare"],
         "ratings": { "strength": 1, "flavor": 5 },
         "score": 10,
         "price": 20.0,
         "vendor_id": "Mystic Waters"
      },
      {
         "name": "Strength",
         "ingredients": ["minotaur blood", "raw protein essence"],
         "categories": ["effective", "budget"],
         "ratings": { "strength": 10, "flavor": 3 },
         "score": 85,
         "price": 12.99,
         "vendor_id": "Draconic IPA"
      },
      {
         "name": "Sleep",
         "ingredients": ["lavender", "sandman’s dust"],
         "categories": ["fairy"],
         "ratings": { "strength": 1, "flavor": 4 },
         "score": 45,
         "price": 7.99,
         "vendor_id": "Leprechaun"
      },
      {
         "name": "Luck", 
         "ingredients": ["water", "Leprechaun's hair"],
         "categories": ["fairy"],
         "ratings": { "strength": 8, "flavor": 5 },
         "score": 100,
         "price": 59.99, 
         "vendor_id": "Leprechaun"
      }
  ]
)
```
La fonction aggregate() prend comme premier argument un tableau de liaisons en champs et renvoi les données formatées
```js
db.potions.aggregate([{$group: {"_id": "$vendor_id"}}])
```
des opérations peuvent être effectuées sur le résulat.
nombre de potion pour chaque vendeur
```js
db.potions.aggregate([{$group: {"_id": "$vendor_id", "total": {$sum: 1}}}])
```
score moyen des potions pour chaque vendeur
```js
db.potions.aggregate([{$group: {"_id": "$vendor_id", "total": {$sum: 1}, "avg_price": {$avg: "$price"}}}])
db.potions.aggregate([{$group: {"_id": "$vendor_id", "max_price": {$max: "$price"}, "min_price": {$min: "$price"}}}])
```
requête optimisée avec filtre 
```js
db.potions.aggregate([
   { $match: {"score": {$gte:5, $lte: 70} }}, 
   { $project: {"_id": false, "vendor_id": true, "score": true}},
   { $group: {"_id": "$vendor_id", "count": {$sum: 1}, "avg_score": {$avg: "$score"}}},
   { $sort: {"avg_score": -1}},
   { $limit: 3}
])
```
Pour compter le nombre de genres distincts :
```js
db.movies.aggregate([
  { $unwind: "$genres" },  // Sépare les genres qui sont dans des tableaux
  { $group: { _id: "$genres" } },  // Regroupe par genre unique
  { $count: "nombre_de_genres" }  // Compte le nombre de genres distincts
])
```

## Back to the nodeJS


## Avec expressJS
```sh
npm i express dotenv cors mongodb mongoose
```
### variables d'environnement
créer un fichier .env (non versionné) contenant les informations de connection
```sh
PORT=3000
MONGO_URI=mongodb://localhost:27017/esgi
```

### serveur applicatif server.js
On gére le serveur web depuis server.js
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const routes = require('./router');

const app = express();
app.use(express.json());
app.use(cors())
```
on ajoute la config mongoose
```javascript
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));
```
on branche les routes
```javascript
app.use('/potions', routes);
```
enfin on lance l'application
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
```

### gestion des routes (controller) router.js

On va préparer les routes dans router.js
```javascript
const express = require('express');
const router = express.Router();
const Potion = require('./potion.model');
```
les routes peuvent être écrites en dur
```javascript
router.get('/', (req, res) => {
  res.send('root')
})
router.get('/about', (req, res) => {
  res.send('about')
})

module.exports = router;
```
leur lecture est synchrone, si une requête destinée à une route est compatible avec une route précédente, elle sera catchée par la première dans l'ordre du fichier.
les routes peuvent également être écrites avec des expressions régulières
```javascript
// this route path will match acd and abcd.
app.get('/ab?cd', (req, res) => { 
  res.send('ab?cd')
})

// This route path will match abcd, abbcd, abbbcd, and so on.
app.get('/ab+cd', (req, res) => {
  res.send('ab+cd')
})

// This route path will match abcd, abxcd, abRANDOMcd, ab123cd, and so on.
app.get('/ab*cd', (req, res) => {
  res.send('ab*cd')
})

// This route path will match /abe and /abcde.
app.get('/ab(cd)?e', (req, res) => {
  res.send('ab(cd)?e')
})

// This route path will match anything with an “a” in it.
app.get(/a/, (req, res) => {
  res.send('/a/')
})

// This route path will match butterfly and dragonfly, but not butterflyman, dragonflyman, and so on.
app.get(/.*fly$/, (req, res) => {
  res.send('/.*fly$/')
})
```
Les noms de routes doivent rester en caractères alpha-numériques ([A-Za-z0-9_]).
Étant donné que le tiret (-) et le point (.) sont interprétés littéralement, ils peuvent être utilisés avec des paramètres de route à des fins utiles. 

```js
// exemple de réservation de billet d'avion.
Route path: /flights/:from-:to
Request URL: http://localhost:3000/flights/LAX-SFO
req.params: { "from": "LAX", "to": "SFO" }

// exemple de recherche multi-catégorielle
Route path: /plantae/:genus.:species{.:optional}
Request URL: http://localhost:3000/plantae/Prunus.persica
req.params: { "genus": "Prunus", "species": "persica" }
```
plus d'info dans la [https://expressjs.com/en/guide/routing.html](doc officielle)  

Revenons à router.js pour notre api de potions
```javascript
// routes de notre api potions
// GET /potions : lire toutes les potions
router.get('/', async (req, res) => {
  try {
    const potions = await Potion.find();
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /potions/:id : lire une potion par ID
// POST /potions : créer une nouvelle potion
// PUT /potions/:id : mettre à jour une potion
// DELETE /potions/:id : supprimer une potion
```

### gestion du model potion.model.js

```javascript
const mongoose = require('mongoose');

const potionSchema = new mongoose.Schema({
  name: String,
  price: Number,
  score: Number,
  ingredients: [mongoose.Schema.Types.Mixed],
  ratings: { strength: Number, flavor: Number },
  tryDate: Date,
  categories: [String],
  vendor_id: String
});

module.exports = mongoose.model('potion', potionSchema);
```

Vous devriez maintenant pouvoir call [```http://localhost:3000/potions```](http://localhost:3000/potions) et recevoir la liste complète.  
Complétez les routes manquantes dans router.js (GET/:id, POST, PUT, DELETE)

### implémentations des requêtes mongoDB

En vous basant sur les requêtes étudiées précédemment, vous pouvez créer vos fonctions grâce à mongoose.
```javascript
// GET /names : récupérer uniquement les noms de toutes les potions
router.get('/names', async (req, res) => {
    try {
        const names = await Potion.find({}, 'name'); // On ne sélectionne que le champ 'name'
        res.json(names.map(p => p.name)); // renvoyer juste un tableau de strings
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```
Implémentez les fonctions suivantes :

```javascript
// GET /potions/vendor/:vendor_id : toutes les potions d’un vendeur
// GET /potions/price-range?min=X&max=Y : potions entre min et max
// GET /analytics/distinct-categories aggregat du nombre total de catégories différentes
// GET /analytics/average-score-by-vendor aggregat du score moyen des vendeurs
// GET /analytics/average-score-by-category aggregat du score moyen des categories
// GET /analytics/strength-flavor-ratio ratio entre force et parfum des potions
// GET /analytics/search fonction de recherche avec 3 paramètres : 
// grouper par vendeur ou catégorie, metrique au choix (avg, sum, count), champ au choix (score, price, ratings).
```

Utilisez votre code pour trouver :
Le nombre de potions par catégorie, le score moyen par catégorie, la moyenne des parfums par vendeur.

## Identification & Middleware

Dans le vocabulaire Express, le middleware est une section de traitement du cycle request-response.
Cela nous permet de découper notre application en sections pour plus de lisibilité et de sécurité.

Installation des dépendances requisent pour une identification avec JWT hashé dans les cookies.
```sh
npm install jsonwebtoken cookie-parser bcryptjs sanitize
```
On met à jour server.js
```js
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(require('sanitize').middleware);
app.use('/auth', require('./routes/auth.routes'));
```

On crée le model utilisateur user.model.js
on ajoute au model utilisateur les méthodes de validation de mot de passe.
```js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  password: { type: String }
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Méthode de comparaison de mot de passe
userSchema.methods.comparePassword = function (plainPwd) {
  return bcrypt.compare(plainPwd, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

On crée le middleware dédié à l'authentification
```js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_change_me';
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
```
On passe au routeur d'authentification qu'on va placer dans un fichier dédié auth.routes.js :  
avec les imports & constantes
```js
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('./user.model');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'demo_node+mongo_token';
```
On ajoute la création d'utilisateur, avec validation des champs et gestion des erreurs
```js
// POST /auth/register  toujours passer les inputs user au sanitize()
router.post('/register', [
  body('username').trim().escape()
    .notEmpty().withMessage('Le nom d’utilisateur est requis.')
    .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
  body('password').trim().escape()
    .notEmpty().withMessage('Le mot de passe est requis.')
    .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
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
```
Puis le login et logout
```js
// POST /auth/login
router.post('/login', async (req, res) => {
  // toujours passer les inputs user au sanitize()
  const name = req.bodyString(name)
  const password = req.bodyString(password)
  const user = await User.findOne({ name });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false, // à mettre sur true en prod (https)
    maxAge: 24 * 60 * 60 * 1000 // durée de vie 24h
  });

  res.json({ message: 'Connecté avec succès' });
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: 'Déconnecté' });
});

module.exports = router;
```

Le middleware est prêt à être utiliser dans les routeurs.
On va limiter toutes les routes avec droit d'écriture pour les réserver aux personnes identifiées.
```js
// POST /potions : créer une nouvelle potion
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newPotion = new Potion(req.body);
        const savedPotion = await newPotion.save();
        res.status(201).json(savedPotion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
```
## Documentation et tests via swagger

On va mettre en place swagger pour avoir une interface visuelle permettant d'informer nos utilisateurs et d'utiliser l'application.
```sh
npm install swagger-ui-express swagger-jsdoc
```

Mettre en place swagger en vous basant sur sa documentation officielle

exemple :
```js
/**
 * @swagger
 * /potions:
 *   get:
 *     summary: Récupérer toutes les potions
 *     responses:
 *       200:
 *         description: Liste des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req, res) => {
    try {
        const potions = await Potion.find();
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

Vous devez maintenant mettre en place un CRUD classique sur les potions, ainsi qu'une route permettant de récupérer une seule potion via son ID. (utilisez la fonction findById())

Ajouter le swagger sur toutes vos routes afin que votre API puisse être testée via son swagger (travail noté correspondant à au moins 50% de la note)