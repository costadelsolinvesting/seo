# Renommer SEO - Outil de renommage d'images optimisé pour le SEO

Application React pour renommer automatiquement vos images avec des noms optimisés pour le référencement Google.

## 🚀 Déploiement sur GitHub Pages

### Méthode 1 : Déploiement automatique (recommandé)

1. **Activer GitHub Pages dans votre dépôt :**
   - Allez sur votre dépôt GitHub : `https://github.com/costadelsolinvesting/seo`
   - Cliquez sur **Settings** → **Pages**
   - Sous **Source**, sélectionnez **GitHub Actions**

2. **Pousser votre code :**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **Le déploiement se fera automatiquement** via GitHub Actions. Une fois terminé, votre site sera disponible à :
   `https://costadelsolinvesting.github.io/seo/`

### Méthode 2 : Déploiement manuel

1. **Construire l'application :**
   ```bash
   npm run build
   ```

2. **Pousser le dossier `dist` sur la branche `gh-pages` :**
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

## 📦 Installation et développement local

**Prérequis :** Node.js

1. **Installer les dépendances :**
   ```bash
   npm install
   ```

2. **Lancer l'application en mode développement :**
   ```bash
   npm run dev
   ```

3. **Construire pour la production :**
   ```bash
   npm run build
   ```

4. **Prévisualiser la version de production :**
   ```bash
   npm run preview
   ```

## 🎯 Fonctionnalités

- Renommage automatique d'images avec des noms SEO-friendly
- Conversion automatique en minuscules avec tirets
- Support des préfixes et suffixes personnalisés
- Inclusion optionnelle de la date au format ISO
- Aperçu en temps réel des nouveaux noms
