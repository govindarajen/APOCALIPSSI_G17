const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
  }
});

// Stockage temporaire
const documentAnalyses = new Map();

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'ComplySummarize IA - API Backend fonctionnelle!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
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

// Import des services
const pdfService = require('./services/pdfService');
const aiService = require('./services/aiService');

// Route d'upload avec vraie IA
app.post('/api/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    console.log('📄 Fichier reçu:', req.file.originalname);

    // Extraire le texte du PDF
    console.log('🔍 Extraction du texte PDF...');
    const pdfData = await pdfService.extractTextFromPDF(req.file.path);
    console.log('✅ Texte extrait, nombre de pages:', pdfData.pages);

    // Analyser avec l'IA
    console.log('🤖 Analyse avec IA...');
    const analysis = await aiService.analyzeDocument(pdfData.text, req.file.originalname);

    // Ajouter les métadonnées du fichier
    analysis.pageCount = pdfData.pages;
    analysis.fileSize = `${Math.round(req.file.size / 1024)} KB`;

    console.log('✅ Analyse terminée avec succès');
    
    // Stocker l'analyse
    const documentId = Date.now().toString();
    documentAnalyses.set(documentId, {
      ...analysis,
      id: documentId,
      uploadedAt: new Date()
    });

    // Nettoyer le fichier temporaire
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      data: {
        id: documentId,
        ...analysis
      },
      message: 'Document analysé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du traitement:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse du document',
      error: error.message
    });
  }
});

// Route pour récupérer les documents
app.get('/api/documents', (req, res) => {
  try {
    const documents = Array.from(documentAnalyses.values()).map(doc => ({
      id: doc.id,
      documentName: doc.documentName,
      processedAt: doc.processedAt,
      pageCount: doc.pageCount,
      fileSize: doc.fileSize
    }));

    res.json({
      success: true,
      data: documents,
      message: 'Documents récupérés avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
});

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
  console.log(`🚀 Serveur ComplySummarize IA démarré sur le port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔗 Frontend: http://localhost:5173`);
});
