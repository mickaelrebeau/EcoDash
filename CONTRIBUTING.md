# 🤝 Guide de Contribution

Merci de l'intérêt que vous portez à EcoDash ! Nous aimons recevoir des contributions de la communauté, qu'il s'agisse de corrections de bugs, de nouvelles fonctionnalités, d'améliorations de la documentation ou simplement de rapports de problèmes.

Ce document fournit des lignes directrices pour contribuer au projet.

---

## 🚀 Comment contribuer

### 1. Rapporter un Bug ou demander une Fonctionnalité

Utilisez l'onglet **Issues** de GitHub.
- Vérifiez d'abord si l'issue existe déjà.
- Utilisez les templates fournis pour structurer votre demande.
- Soyez aussi précis que possible (étapes de reproduction, environnement, etc.).

### 2. Développement Local

1.  **Fork** le dépôt sur GitHub.
2.  **Clone** votre fork localement :
    ```bash
    git clone https://github.com/votre-username/ecodash.git
    cd ecodash
    ```
3.  **Installez** les dépendances :
    ```bash
    npm install
    ```
4.  **Créez une branche** pour votre modification :
    ```bash
    git checkout -b type/nom-de-votre-branche
    # Exemple: git checkout -b feat/ajout-export-pdf
    ```

### 3. Standards de Code

#### Vue & TypeScript
- Nous utilisons l'**API de Composition** avec `<script setup lang="ts">`.
- Typez explicitement vos props, emits et variables complexes.
- Évitez `any` autant que possible.
- Utilisez des **Composables** (`composables/`) pour la logique réutilisable.

#### Styles (Tailwind CSS)
- Utilisez les classes utilitaires Tailwind directement dans le template.
- Pour les classes conditionnelles complexes, utilisez l'utilitaire `cn()` (dans `utils/cn.ts`).

#### Commits
Nous suivons la convention [Conventional Commits](https://www.conventionalcommits.org/) :
- `feat: ...` pour une nouvelle fonctionnalité.
- `fix: ...` pour une correction de bug.
- `docs: ...` pour la documentation.
- `style: ...` pour des changements de formatage (espaces, virgules, etc).
- `refactor: ...` pour du refactoring sans changement de fonctionnalité.

Exemple : `feat(dashboard): ajouter un graphique de répartition`

### 4. Soumettre une Pull Request (PR)

1.  Poussez vos changements sur votre fork : `git push origin feat/ma-feature`.
2.  Ouvrez une **Pull Request** vers la branche `main` du dépôt principal.
3.  Remplissez le modèle de PR avec soin.
4.  Attendez la revue de code !

---

## 🧪 Tests

Assurez-vous que l'application se lance correctement :
```bash
npm run dev
```
(Les tests unitaires seront ajoutés prochainement, assurez-vous de ne pas casser le build existant).

---

## 📜 Code de Conduite

Veuillez noter que ce projet est régi par un [Code de Conduite](CODE_OF_CONDUCT.md). En participant, vous acceptez de respecter ses termes.

Merci de contribuer à rendre EcoDash meilleur ! 🌱
