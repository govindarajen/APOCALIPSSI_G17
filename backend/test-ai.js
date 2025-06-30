const fs = require('fs');
const aiService = require('./services/aiService');

async function testAI() {
  try {
    console.log('🧪 Test de l\'IA ComplySummarize...\n');
    
    // Lire le document de test
    const testText = fs.readFileSync('./test-document.txt', 'utf8');
    console.log('📄 Document de test chargé:', testText.length, 'caractères\n');
    
    // Analyser le document
    console.log('🚀 Début de l\'analyse...\n');
    const result = await aiService.analyzeDocument(testText, 'rapport-audit-test.pdf');
    
    // Afficher les résultats
    console.log('📊 RÉSULTATS DE L\'ANALYSE:');
    console.log('=' .repeat(50));
    
    console.log('\n📝 RÉSUMÉ EXÉCUTIF:');
    console.log(result.executiveSummary);
    
    console.log('\n🔍 POINTS CLÉS:');
    result.keyPoints.forEach((point, index) => {
      console.log(`${index + 1}. ${point}`);
    });
    
    console.log('\n💡 SUGGESTIONS D\'ACTIONS:');
    result.actionSuggestions.forEach((action, index) => {
      console.log(`${index + 1}. [${action.priority.toUpperCase()}] ${action.title}`);
      console.log(`   ${action.description}\n`);
    });
    
    console.log('📈 MÉTADONNÉES:');
    Object.entries(result.metadata).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n✅ Test terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testAI();
