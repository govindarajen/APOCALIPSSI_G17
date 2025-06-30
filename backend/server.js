const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import des routes
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // URL du frontend
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: 'ComplySummarize IA - API Backend fonctionnelle!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      documents: '/api/documents',
      upload: '/api/documents/upload'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ComplySummarize IA Backend'
  });
});

// Routes des documents
app.use('/api/documents', documentRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Quelque chose s\'est mal passé!' });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
