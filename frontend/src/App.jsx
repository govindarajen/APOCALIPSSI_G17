import { useState } from 'react'
import { FileText, Key, Lightbulb, Download, ArrowLeft } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState('upload') // 'upload', 'summary'
  const [selectedFile, setSelectedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Veuillez sélectionner un fichier PDF')
    }
  }

  const handleProcessDocument = async () => {
    if (!selectedFile) return

    setIsProcessing(true)

    try {
      // Créer un FormData pour l'upload
      const formData = new FormData()
      formData.append('document', selectedFile)

      console.log('Envoi du fichier au backend...')

      // Envoyer le fichier au backend
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        console.log('Analyse reçue:', result.data)
        setSummary(result.data)
        setCurrentView('summary')
      } else {
        throw new Error(result.message || 'Erreur lors de l\'analyse')
      }

    } catch (error) {
      console.error('Erreur lors du traitement:', error)
      alert(`Erreur lors de l'analyse: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBackToUpload = () => {
    setCurrentView('upload')
    setSelectedFile(null)
    setSummary(null)
  }

  const handleDownloadSummary = () => {
    if (!summary) return

    const content = `
COMPLYSUMMARIZE IA - RAPPORT D'ANALYSE
=====================================

Document analysé: ${summary.documentName}
Date d'analyse: ${summary.processedAt}
Nombre de pages: ${summary.pageCount}

RÉSUMÉ EXÉCUTIF
===============
${summary.executiveSummary}

POINTS CLÉS IDENTIFIÉS
=====================
${summary.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

SUGGESTIONS D'ACTIONS PRIORITAIRES
==================================
${summary.actionSuggestions.map((action, i) => `${i + 1}. [${action.priority.toUpperCase()}] ${action.title}
   ${action.description}`).join('\n\n')}

---
Rapport généré par ComplySummarize IA - APOCAL'IPSSI 2025
    `

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ComplySummarize_${summary.documentName.replace('.pdf', '')}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-container">
      {currentView === 'upload' && (
        <div className="main-card">
          <h1 className="main-title">ComplySummarize IA</h1>
          <p className="subtitle">Assistant intelligent de synthèse documentaire</p>

          <p className="description">
            Glissez-déposez simplement votre fichier PDF<br />
            et laissez l'interface faire le travail pour vous.
          </p>

          <div className="upload-section">
            <div className="file-input-container">
              <input
                type="text"
                className="file-input"
                placeholder={selectedFile ? selectedFile.name : "filename.pdf"}
                readOnly
              />
              <label htmlFor="file-upload" className="upload-btn">
                Upload
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {selectedFile && (
              <div className="file-selected">
                <FileText className="file-icon" size={24} />
                <div className="file-info">
                  <h4>{selectedFile.name}</h4>
                  <p>{Math.round(selectedFile.size / 1024)} KB • PDF</p>
                </div>
              </div>
            )}

            {isProcessing ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Analyse en cours par l'IA...</p>
              </div>
            ) : (
              <button
                className="analyze-btn"
                onClick={handleProcessDocument}
                disabled={!selectedFile}
              >
                Analyse PDF
              </button>
            )}
          </div>
        </div>
      )}

      {currentView === 'summary' && summary && (
        <div className="summary-container">
          <div className="nav-buttons">
            <button className="nav-btn" onClick={handleBackToUpload}>
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
              Nouveau document
            </button>
            <button className="nav-btn" onClick={handleDownloadSummary}>
              <Download size={16} style={{ marginRight: '0.5rem' }} />
              Télécharger le rapport
            </button>
          </div>

          <div className="summary-card">
            <div className="summary-header">
              <FileText size={32} color="#3498db" />
              <div>
                <h2 className="summary-title">{summary.documentName}</h2>
                <p className="summary-meta">
                  Analysé le {summary.processedAt} • {summary.pageCount} pages
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 className="section-title">
                <FileText size={20} />
                Résumé exécutif
              </h3>
              <p style={{ color: '#34495e', lineHeight: '1.8' }}>
                {summary.executiveSummary}
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 className="section-title">
                <Key size={20} color="#3498db" />
                Points clés identifiés
              </h3>
              <ul className="key-points">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="key-point">
                    <div className="point-bullet"></div>
                    <p>{point}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="section-title">
                <Lightbulb size={20} color="#2ecc71" />
                Suggestions d'actions prioritaires
              </h3>
              {summary.actionSuggestions.map((action, index) => (
                <div key={index} className="action-item">
                  <div className="action-header">
                    <div>
                      <h4 className="action-title">{action.title}</h4>
                      <p style={{ color: '#7f8c8d' }}>{action.description}</p>
                    </div>
                    <span className={`priority-badge priority-${action.priority}`}>
                      {action.priority === 'high' ? 'Urgent' :
                       action.priority === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
              Rapport généré par ComplySummarize IA • Formation APOCAL'IPSSI 2025
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
