# 📦 Guide d'Installation

Ce guide vous accompagne dans l'installation et la configuration d'EcoDash.

## Prérequis

### Système

| Outil | Version minimale | Recommandé |
|-------|-----------------|------------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| pnpm (alternatif) | 8.x | 9.x |

### Vérification des prérequis

```bash
# Vérifier Node.js
node --version
# Attendu: v18.x.x ou supérieur

# Vérifier npm
npm --version
# Attendu: 9.x.x ou supérieur
```

---

## Installation Standard

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/ecodash.git
cd ecodash
```

### 2. Installer les dépendances

```bash
# Avec npm
npm install

# Ou avec pnpm (recommandé pour la performance)
pnpm install
```

### 3. Configuration de l'environnement

Copier le fichier d'exemple et le configurer :

```bash
cp .env.example .env
```

Éditer le fichier `.env` :

```env
# Mode de l'application
NUXT_PUBLIC_APP_MODE=development

# API Configuration
NUXT_API_BASE_URL=http://localhost:3000/api

# Base de données (optionnel - Phase avancée)
DATABASE_URL=postgresql://user:password@localhost:5432/ecodash

# Données temps réel
REALTIME_ENABLED=true
REALTIME_INTERVAL_MS=5000
```

### 4. Lancer l'application

```bash
# Mode développement
npm run dev
```

🎉 L'application est accessible sur [http://localhost:3000](http://localhost:3000)

---

## Installation avec Docker

### Prérequis Docker

- Docker >= 24.x
- Docker Compose >= 2.x

### Lancement rapide

```bash
# Build et lancement
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NUXT_API_BASE_URL=http://localhost:3000/api
    restart: unless-stopped

  # Optionnel : Base de données
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ecodash
      POSTGRES_USER: ecodash
      POSTGRES_PASSWORD: ecodash_secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

---

## Configuration de la Base de Données

### SQLite (Développement)

Par défaut, l'application utilise SQLite pour simplifier le développement :

```env
DATABASE_URL=file:./data/ecodash.db
```

### PostgreSQL (Production)

Pour un environnement de production :

```env
DATABASE_URL=postgresql://user:password@host:5432/ecodash
```

### Migration de la base

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Seed des données de test
npm run db:seed
```

---

## Configuration shadcn-ui

L'installation de shadcn-ui est automatique lors du `npm install`. Pour ajouter de nouveaux composants :

```bash
# Ajouter un composant
npx shadcn-vue@latest add button

# Ajouter plusieurs composants
npx shadcn-vue@latest add card dialog table
```

### Composants utilisés

| Composant | Usage |
|-----------|-------|
| `Card` | KPIs, conteneurs |
| `Table` | Historique des données |
| `Dialog` | Modales de configuration |
| `Form` | Formulaires de saisie |
| `Button` | Actions utilisateur |
| `Tabs` | Navigation par onglets |
| `Select` | Sélecteurs de période |

---

## Vérification de l'installation

### Tests de santé

```bash
# Vérifier que l'application démarre
npm run dev

# Lancer les tests
npm run test

# Vérifier la qualité du code
npm run lint
```

### Checklist de validation

- [ ] L'application démarre sans erreur
- [ ] La page `/dashboard` s'affiche
- [ ] Le dark mode fonctionne
- [ ] Les graphiques se chargent
- [ ] Les données temps réel se mettent à jour

---

## Dépannage

### Erreurs courantes

#### `EACCES: permission denied`

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

#### Port 3000 déjà utilisé

```bash
# Changer le port
npm run dev -- --port 3001
```

#### Erreur de version Node.js

```bash
# Utiliser nvm pour gérer les versions
nvm install 20
nvm use 20
```

### Support

En cas de problème, ouvrir une issue sur GitHub avec :
- Version de Node.js
- Système d'exploitation
- Message d'erreur complet
- Étapes pour reproduire

---

## Prochaines étapes

Une fois l'installation terminée, consultez :

- [Architecture détaillée](./architecture.md)
- [Guide de contribution](./contributing.md)
- [API Reference](./api-reference.md)
