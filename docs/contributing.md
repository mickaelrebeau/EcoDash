# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à EcoDash !

---

## 🚀 Comment contribuer

### 1. Fork et Clone

```bash
# Fork le repo sur GitHub puis :
git clone https://github.com/votre-username/ecodash.git
cd ecodash
npm install
```

### 2. Créer une branche

```bash
git checkout -b feature/ma-fonctionnalite
# ou
git checkout -b fix/mon-bug
```

### 3. Développer

```bash
npm run dev
```

### 4. Tester

```bash
npm run test
npm run lint
```

### 5. Commit

Suivez le format [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
git commit -m "feat: ajouter graphique heatmap"
git commit -m "fix: corriger calcul CO2"
git commit -m "docs: mettre à jour README"
```

| Préfixe | Usage |
|---------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage |
| `refactor` | Refactoring |
| `test` | Tests |
| `chore` | Maintenance |

### 6. Pull Request

```bash
git push origin feature/ma-fonctionnalite
```

Puis créez une PR sur GitHub avec :
- Description claire des changements
- Captures d'écran si UI modifiée
- Tests ajoutés si applicable

---

## 📋 Standards de code

### TypeScript

- Typer toutes les fonctions
- Éviter `any`
- Utiliser les interfaces

### Vue

- Composition API avec `<script setup>`
- Composables pour la logique réutilisable
- Props typées

### CSS

- Tailwind classes
- Nommage BEM si CSS custom

---

## 📁 Structure des commits

```
feat(charts): ajouter support ECharts
^--^ ^----^  ^-----------------------^
|    |       |
|    |       └─> Description
|    └─> Scope (optionnel)
└─> Type
```

---

## ❓ Questions

Ouvrez une issue ou contactez les mainteneurs.

Merci pour vos contributions ! 🌱
