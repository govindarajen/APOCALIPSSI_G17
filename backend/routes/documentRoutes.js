const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pdfService = require('../services/pdfService');
const aiService = require('../services/aiService');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
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
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
  }
});

// Stockage temporaire des analyses (en production, utiliser une base de données)
const documentAnalyses = new Map();

// Route pour uploader et analyser un document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    console.log('Fichier reçu:', req.file.originalname);

    // Extraire le texte du PDF
    const pdfData = await pdfService.extractTextFromPDF(req.file.path);
    console.log('Texte extrait, nombre de pages:', pdfData.pages);

    // Analyser avec l'IA
    const analysis = await aiService.analyzeDocument(pdfData.text, req.file.originalname);
    
    // Ajouter les métadonnées du fichier
    analysis.pageCount = pdfData.pages;
    analysis.fileSize = `${Math.round(req.file.size / 1024)} KB`;
    
    // Stocker l'analyse
    const documentId = Date.now().toString();
    documentAnalyses.set(documentId, {
      ...analysis,
      id: documentId,
      filePath: req.file.path,
      uploadedAt: new Date()
    });

    // Nettoyer le fichier temporaire
    fs.unlinkSync(req.file.path);

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
    
    // Nettoyer le fichier en cas d'erreur
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

// Route pour récupérer une analyse par ID
router.get('/:id/summary', (req, res) => {
  try {
    const documentId = req.params.id;
    const analysis = documentAnalyses.get(documentId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    res.json({
      success: true,
      data: analysis,
      message: 'Analyse récupérée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'analyse',
      error: error.message
    });
  }
});

// Route pour lister tous les documents analysés
router.get('/', (req, res) => {
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
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
});

// Route pour supprimer une analyse
router.delete('/:id', (req, res) => {
  try {
    const documentId = req.params.id;
    const deleted = documentAnalyses.delete(documentId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Document supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
      error: error.message
    });
  }
});

// Route de test pour vérifier le service
router.get('/test/health', (req, res) => {
  res.json({
    success: true,
    message: 'Service de documents opérationnel',
    timestamp: new Date().toISOString(),
    documentsCount: documentAnalyses.size
  });
});

module.exports = router;
