# Feuille de Match — Organisation Rugby Club 🏉

Application web moderne pour les clubs de rugby : gestion et planification des matchs, plateaux École de Rugby (EDR), tournois, logistique matérielle, besoins administratifs FFR, bénévoles et communication.

---

## ⚡ Fonctionnalités

- **Tableau de bord de l'Ovalie** :
  - Suivi des matchs à venir avec compte à rebours (*J-X, Aujourd'hui, Demain*).
  - Taux de préparation globale, postes bénévoles à pourvoir et inventaire.
  - Modèles rapides : *Match Senior à domicile*, *Plateau EDR*, *Soirée Club House*.
- **Calendrier des rencontres** :
  - Calendrier mensuel (du lundi au dimanche) adapté au rythme des saisons de rugby.
  - 6 catégories officielles FFR & club avec repères de couleurs.
  - Création directe d'un événement au clic sur une date.
- **Fiches de match & Feuilles de route** :
  - **Matériel** : Ballons T5/T4, tees, trousse médicale FFR, table de marque, chasubles (pack en 1 clic).
  - **Logistique & Administratif** : Feuilles Oval-e FFR, licences, vestiaires arbitres & délégués, commande buvette.
  - **Bénévoles** : Gestion des créneaux, liens WhatsApp/Google Forms et bouton de génération automatique de message WhatsApp à copier-coller dans le groupe du club.
  - **Communication** : Suivi des affiches Canva, compos réseaux sociaux et photos.
- **Impression officielle & Sauvegardes** :
  - Modèle imprimable pour le terrain / export PDF avec cadre de signatures.
  - Export et import de sauvegardes au format JSON.
  - Persistance automatique en local (`localStorage`).

---

## 🚀 Démarrage rapide

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- `npm` ou `pnpm` ou `yarn`

### Installation

```bash
# 1. Cloner le dépôt
git clone <URL_DE_VOTRE_DEPOT_GIT>
cd <NOM_DU_DOSSIER>

# 2. Installer les dépendances
npm install

# 3. Lancer en local
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000) (ou le port indiqué dans votre terminal).

### Construction pour la production

```bash
npm run build
```

Les fichiers générés se trouveront dans le dossier `dist/` et peuvent être hébergés gratuitement sur Vercel, Netlify, Cloudflare Pages ou GitHub Pages.

---

## 🛠️ Stack technique

- **React 19** + **TypeScript**
- **Vite** pour le build ultra-rapide
- **Tailwind CSS v4** pour le design responsive
- **Lucide React** pour les icônes sportives et d'organisation
- **Polices** : *Oswald* (titres rugby/sport) & *Work Sans* (lisibilité)
