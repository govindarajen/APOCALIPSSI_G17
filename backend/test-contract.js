const fs = require('fs');
const aiService = require('./services/aiService');

async function testContractAnalysis() {
  try {
    console.log('🧪 Test IA - Analyse de contrat de travail...\n');
    
    // Lire le contrat de test
    const contractText = fs.readFileSync('./test-pdf-content.txt', 'utf8');
    console.log('📄 Contrat chargé:', contractText.length, 'caractères\n');
    
    // Analyser le contrat
    console.log('🚀 Analyse du contrat...\n');
    const result = await aiService.analyzeDocument(contractText, 'contrat-travail-cdi.pdf');
    
    // Afficher les résultats
    console.log('📊 ANALYSE DU CONTRAT DE TRAVAIL:');
    console.log('=' .repeat(60));
    
    console.log('\n📝 RÉSUMÉ:');
    console.log(result.executiveSummary);
    
    console.log('\n🔍 POINTS CLÉS:');
    result.keyPoints.forEach((point, index) => {
      console.log(`${index + 1}. ${point}`);
    });
    
    console.log('\n💡 ACTIONS RECOMMANDÉES:');
    result.actionSuggestions.forEach((action, index) => {
      console.log(`${index + 1}. [${action.priority.toUpperCase()}] ${action.title}`);
      console.log(`   ${action.description}\n`);
    });
    
    console.log('📈 MÉTADONNÉES:');
    Object.entries(result.metadata).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n✅ Test contrat terminé!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testContractAnalysis();
