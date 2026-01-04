# 🌱 EcoDash

> Dashboard de suivi de consommation énergétique et impact écologique en temps réel.

![EcoDash Dashboard](public/preview.png)

EcoDash est une application moderne construite avec **Nuxt 3** permettant de visualiser, analyser et réduire votre consommation électrique. Conçu pour être rapide, beau et informatif.

## ✨ Fonctionnalités

- ⚡ **Temps Réel** : Visualisation de la puissance instantanée avec graphiques dynamiques fluides.
- 🌍 **Impact Écologique** : Conversion automatique des kWh en CO₂ et équivalents concrets (km en voiture, arbres, etc.).
- 📊 **Analyses** : Historique de consommation, pics de puissance, et répartition par usage.
- 🔔 **Alertes** : Système de détection d'anomalies et dépassement de seuil.
- 💾 **Données** : Import compatible avec les exports Enedis/Linky (CSV).
- 🎨 **Design** : Interface soignée, mode sombre/clair, et responsive.

## 🛠 Tech Stack

- **Framework** : [Nuxt 3](https://nuxt.com) (Vue 3)
- **Styling** : [Tailwind CSS](https://tailwindcss.com) + [Shadcn UI](https://ui.shadcn.com) logic
- **Charts** : SVG Custom Sparklines + Chart.js
- **Icons** : [Lucide Vue](https://lucide.dev)
- **State** : Vue Composition API (Refs/Computed)

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- npm, pnpm, ou yarn

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/ecodash.git
cd ecodash

# Installer les dépendances
npm install
```

### Lancer en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`.

## 📦 Structure du Projet

- `components/` : Composants Vue réutilisables (Charts, KPI, UI).
- `composables/` : Logique métier (Calculs, API, Realtime).
- `pages/` : Routes de l'application (Dashboard, Settings, Data).
- `server/` : API Nitro pour la gestion des données simulées et persistantes.
- `public/` : Assets statiques.

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre [Guide de Contribution](CONTRIBUTING.md) pour commencer.

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'feat: Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

Fait avec ❤️ pour la planète.
