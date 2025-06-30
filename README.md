# Projet Full-Stack React + Node.js

Ce projet contient une application full-stack avec React pour le frontend et Node.js/Express pour le backend.

## Structure du projet

```
appocalypsi/
├── frontend/          # Application React (Vite)
├── backend/           # API Node.js/Express
├── README.md
└── .gitignore
```

## Installation et démarrage

### Backend (API Node.js)

```bash
cd backend
npm install
npm run dev
```

Le serveur backend sera accessible sur `http://localhost:5000`

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

L'application React sera accessible sur `http://localhost:5173`

## Endpoints API disponibles

- `GET /` - Message de bienvenue
- `GET /api/health` - Vérification de l'état de l'API
- `GET /api/users` - Liste d'exemple des utilisateurs

## Technologies utilisées

### Frontend
- React 18
- Vite
- JavaScript

### Backend
- Node.js
- Express.js
- CORS
- dotenv
- nodemon (développement)

## Développement

Pour développer en parallèle, ouvrez deux terminaux :
1. Un pour le backend : `cd backend && npm run dev`
2. Un pour le frontend : `cd frontend && npm run dev`
