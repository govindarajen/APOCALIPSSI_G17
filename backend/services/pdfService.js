const pdfParse = require('pdf-parse');
const fs = require('fs');

class PDFService {
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);

      // Essayer d'abord comme un PDF
      try {
        const data = await pdfParse(dataBuffer);
        return {
          text: data.text,
          pages: data.numpages,
          info: data.info
        };
      } catch (pdfError) {
        console.log('⚠️ Échec extraction PDF, tentative comme fichier texte...');

        // Fallback: traiter comme un fichier texte
        const textContent = dataBuffer.toString('utf8');
        if (textContent && textContent.trim().length > 0) {
          console.log('✅ Fichier traité comme texte');
          return {
            text: textContent,
            pages: Math.ceil(textContent.length / 3000), // Estimation: 3000 chars par page
            info: { title: 'Document texte' }
          };
        }

        throw pdfError;
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      throw new Error('Impossible d\'extraire le texte du document');
    }
  }

  // Nettoyer et préparer le texte pour l'IA
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples
      .replace(/\n+/g, '\n') // Remplacer les sauts de ligne multiples
      .trim()
      .substring(0, 4000); // Limiter à 4000 caractères pour l'API gratuite
  }

  // Diviser le texte en chunks si trop long
  chunkText(text, maxLength = 3000) {
    const chunks = [];
    let currentChunk = '';
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        }
      } else {
        currentChunk += sentence + '.';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}

module.exports = new PDFService();
