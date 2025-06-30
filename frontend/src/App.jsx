import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [users, setUsers] = useState([])
  const [apiStatus, setApiStatus] = useState('Vérification...')

  // Fonction pour tester la connexion à l'API
  const checkApiHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health')
      if (response.ok) {
        setApiStatus('✅ API connectée')
      } else {
        setApiStatus('❌ API non disponible')
      }
    } catch (error) {
      setApiStatus('❌ Erreur de connexion')
    }
  }

  // Fonction pour récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
    }
  }

  useEffect(() => {
    checkApiHealth()
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Node.js</h1>

      <div className="card">
        <p>Status de l'API: {apiStatus}</p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={fetchUsers} style={{ marginLeft: '10px' }}>
          Charger les utilisateurs
        </button>
      </div>

      {users.length > 0 && (
        <div className="card">
          <h3>Utilisateurs depuis l'API:</h3>
          <ul style={{ textAlign: 'left' }}>
            {users.map(user => (
              <li key={user.id}>{user.name} - {user.email}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="read-the-docs">
        Cliquez sur "Charger les utilisateurs" pour tester la communication avec l'API
      </p>
    </>
  )
}

export default App
