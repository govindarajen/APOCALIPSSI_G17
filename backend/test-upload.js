const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  try {
    console.log('🧪 Test d\'upload via API...\n');
    
    // Créer un fichier PDF de test simple
    const testContent = `
RAPPORT DE SÉCURITÉ INFORMATIQUE
Entreprise XYZ - Audit 2025

RÉSUMÉ EXÉCUTIF
L'audit de sécurité informatique révèle plusieurs vulnérabilités critiques nécessitant une action immédiate.

VULNÉRABILITÉS IDENTIFIÉES
1. Mots de passe faibles sur 60% des comptes utilisateurs
2. Absence de chiffrement sur les données sensibles
3. Systèmes non mis à jour depuis 6 mois
4. Accès non contrôlés aux serveurs critiques

RECOMMANDATIONS URGENTES
- Mise en place d'une politique de mots de passe renforcée
- Chiffrement immédiat des données sensibles
- Mise à jour de sécurité de tous les systèmes
- Audit des accès et révocation des droits non nécessaires

NIVEAU DE RISQUE: ÉLEVÉ
Action requise dans les 48 heures.
    `;
    
    // Écrire le contenu dans un fichier temporaire
    fs.writeFileSync('./temp-test.txt', testContent);
    
    // Créer un FormData pour simuler l'upload
    const formData = new FormData();
    formData.append('document', fs.createReadStream('./temp-test.txt'), {
      filename: 'rapport-securite.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('📤 Envoi du fichier à l\'API...');
    
    // Envoyer à l'API
    const response = await axios.post('http://localhost:5000/api/documents/upload', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    if (response.data.success) {
      console.log('✅ Upload réussi!\n');
      
      const result = response.data.data;
      
      console.log('📊 RÉSULTAT DE L\'ANALYSE:');
      console.log('=' .repeat(50));
      
      console.log('\n📝 RÉSUMÉ:');
      console.log(result.executiveSummary);
      
      console.log('\n🔍 POINTS CLÉS:');
      result.keyPoints.forEach((point, index) => {
        console.log(`${index + 1}. ${point}`);
      });
      
      console.log('\n💡 ACTIONS:');
      result.actionSuggestions.forEach((action, index) => {
        console.log(`${index + 1}. [${action.priority.toUpperCase()}] ${action.title}`);
      });
      
      console.log('\n📈 MÉTADONNÉES:');
      Object.entries(result.metadata).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
    } else {
      console.error('❌ Échec de l\'upload:', response.data.message);
    }
    
    // Nettoyer le fichier temporaire
    fs.unlinkSync('./temp-test.txt');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

testUpload();
