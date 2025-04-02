require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const routes = require('./router');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())





mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));

app.use('/potions', routes);

app.use(require('sanitize').middleware);
app.use('/auth', require('./auth.routes'));

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Documentation de l\'API pour le projet Node.js et MongoDB',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'demo_node+mongo_token',
          },
        },
      },
      security: [
        {
          cookieAuth: [],
        },
      ],
    },
    apis: ['./**.js'],
  };

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Route Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});