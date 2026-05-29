# 🚗 ParkScan Mobile

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

**ParkScan Mobile** est une application mobile professionnelle conçue pour la gestion sécurisée et automatisée du stationnement des véhicules administratifs (notamment au sein du parking TPS). Grâce à des capacités avancées de reconnaissance optique de caractères (OCR), l'application permet de scanner, traiter, et archiver rapidement les plaques d'immatriculer et de générer des rapports officiels structurés.

---

## ✨ Fonctionnalités Principales

- 📸 **Scanner OCR Intelligent** : Numérisation rapide des plaques d'immatriculation via l'appareil photo, avec extraction automatique du numéro et présélection de la marque de voiture basée sur l'analyse de l'image.
- 🗂️ **Gestion Multi-Niveaux** : Catégorisation des véhicules stationnés selon leur emplacement exact (Étage 1, 2, 3, 4 et Parking Général).
- 📱 **Interface Fluide et Intuitive** : Navigation par onglets balayables (Swipeable Tabs) avec design en "Clean Architecture", en plus du support du "Safe Area" pour garantir une visibilité parfaite sur tout type d'écran.
- 📴 **Mode Hors-Ligne (Brouillons)** : Sauvegarde instantanée des captures en local. Vous pouvez capturer sans connexion internet et traiter les données plus tard.
- 📥 **Exportation Multi-Formats (PDF, Excel, CSV)** :
  - **Reçus Officiels** : La génération des rapports intègre dynamiquement des en-têtes officiels avec la date du jour et la localisation exacte.
  - **Structuration** : Les données sont groupées par étages (Tableau par emplacement) avec une numérotation incrémentale.
  - **Prêt pour l'impression** : Format PDF optimisé pour un format papier standard (Marges standard A4 respectées pour l'environnement de bureau).

---

## 🛠️ Stack Technique

- **Framework :** React Native avec Expo (Managed Workflow)
- **Navigation :** React Navigation (Top Tabs & Native Stack)
- **Stockage Local :** SQLite (via Expo SQLite) pour un stockage persistant robuste.
- **Exportation :** `expo-print` (PDF), `xlsx` (Excel), et `expo-file-system` (CSV).
- **Design & Icônes :** Lucide React Native avec une feuille de style centralisée (Theme `COLORS`).

---

## 🚀 Installation & Lancement

1. **Cloner le projet**
   ```bash
   git clone https://github.com/JHAMDI1/parkscan-mobile.git
   cd parkscan-mobile
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer l'application en mode développement**
   ```bash
   npx expo start -c
   ```
   > Scannez le QR code via l'application [Expo Go](https://expo.dev/client) sur votre périphérique Android/iOS.

---

## 🏗️ Architecture du Projet

Le projet respecte les principes de la **Clean Architecture** assurant une scalabilité maximale :

```
src/
├── components/    # Composants réutilisables (Boutons, Inputs, Pickers)
├── constants/     # Variables globales, Marques, Thème visuel (COLORS)
├── context/       # Gestion d'état global (ex: Authentification AuthContext)
├── db/            # Couche base de données SQLite locales
├── navigation/    # Configurations du système de routage (Tab & Stack Navigators)
├── screens/       # Écrans principaux (Capture, Traitement, Historique)
├── services/      # Logique métier et appels externes (OCR, Gestion de véhicules)
└── validation/    # Schémas et validation de données
```

---

## 🔐 Sécurité & Performances

- **Traitement Local** : Pour éviter toute latence et respecter les données privées, la base de données est stockée sur l'appareil.
- **Optimisation des Exports** : Création et manipulation des buffers de fichiers optimisées via les API natives (`expo-file-system`).

---

**Développé par Jouini Hamdi**  
*Propulsé pour la Direction Centrale*
