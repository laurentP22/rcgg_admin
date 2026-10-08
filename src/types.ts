export type UserRole = "Admin" | "Benevole" | "Joueur";
export type UserStatus = "pending" | "approved" | "rejected" | "deactivated";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export const BOOTSTRAP_ADMIN_EMAIL = "laurent22100@gmail.com";

export const DEFAULT_SAMPLE_USERS: UserProfile[] = [
  {
    uid: "fake-benevole-1",
    displayName: "Benevol1",
    email: "benevol1@rugby-club.fr",
    role: "Benevole",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    approvedBy: "laurent22100@gmail.com",
  },
  {
    uid: "fake-joueur-1",
    displayName: "Joueur1",
    email: "joueur1@rugby-club.fr",
    role: "Joueur",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 86400000).toISOString(),
    approvedBy: "laurent22100@gmail.com",
  },
];

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface VolunteerItem {
  id: string;
  poste: string;
  creneau: string;
  nombre: string;
  lien: string;
}

export interface CommunicationItem {
  id: string;
  date: string;
  lien: string;
  quoi: string;
}

export interface EventItem {
  id: string;
  nom: string;
  type: string;
  cat: string;
  date: string; // YYYY-MM-DD
  lieu: string;
  horaire?: string;
  adversaire?: string;
  notes?: string;
  materiel: ChecklistItem[];
  todo: ChecklistItem[];
  benevoles: VolunteerItem[];
  com: CommunicationItem[];
}

export interface EventTypeInfo {
  id: string;
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
}

export const TYPES: EventTypeInfo[] = [
  {
    id: "edr_dom",
    label: "Plateau EDR à domicile",
    color: "#3E6FBE",
    badgeBg: "bg-blue-600 text-white",
    badgeBorder: "border-blue-600",
    description: "École de rugby (M8 à M14) sur les terrains du club",
  },
  {
    id: "edr_ext",
    label: "Plateau EDR à l'extérieur",
    color: "#C1503E",
    badgeBg: "bg-orange-600 text-white",
    badgeBorder: "border-orange-600",
    description: "Déplacement de l'école de rugby chez un autre club",
  },
  {
    id: "senior_dom",
    label: "Match senior à domicile",
    color: "#12294D",
    badgeBg: "bg-[#122A54] text-white",
    badgeBorder: "border-[#122A54]",
    description: "Championnat ou amical au stade du club",
  },
  {
    id: "senior_ext",
    label: "Match senior à l'extérieur",
    color: "#7A1414",
    badgeBg: "bg-[#9B1E1E] text-white",
    badgeBorder: "border-[#9B1E1E]",
    description: "Déplacement équipe première ou réserve",
  },
  {
    id: "asso_club",
    label: "Événement associatif au club",
    color: "#8FB4E3",
    badgeBg: "bg-sky-500 text-white",
    badgeBorder: "border-sky-500",
    description: "Soirée club house, repas, fête de fin d'année, retransmission",
  },
  {
    id: "asso_ext",
    label: "Événement associatif à l'extérieur",
    color: "#E3A79C",
    badgeBg: "bg-rose-400 text-slate-900",
    badgeBorder: "border-rose-400",
    description: "Forum des assos, tournoi partenaires, téléthon",
  },
];

export const CATS = [
  "École de Rugby (M8-M14)",
  "Cadets (M16)",
  "Juniors (M19)",
  "Seniors (Équipe 1 & 2)",
  "Féminines",
  "Loisirs / Vétérans",
  "Club entier",
];

export function getTypeInfo(id: string): EventTypeInfo {
  const found = TYPES.find((t) => t.id === id);
  return found || TYPES[0];
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

export function calculateProgress(ev: EventItem): number {
  const total = (ev.materiel?.length || 0) + (ev.todo?.length || 0);
  if (!total) return 0;
  const doneMat = (ev.materiel || []).filter((i) => i.done).length;
  const doneTodo = (ev.todo || []).filter((i) => i.done).length;
  return Math.round(((doneMat + doneTodo) / total) * 100);
}

export function formatDateFrench(isoDate: string): string {
  if (!isoDate) return "Date à définir";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  if (isNaN(d.getTime())) return isoDate;
  const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(isoDate: string): string {
  if (!isoDate) return "Non fixée";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  if (isNaN(d.getTime())) return isoDate;
  const jours = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
  const mois = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
}

export function isPastDate(isoDate: string): boolean {
  if (!isoDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = isoDate.split("-");
  if (parts.length !== 3) return false;
  const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return target < today;
}

export function getDaysRemaining(isoDate: string): number | null {
  if (!isoDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = isoDate.split("-");
  if (parts.length !== 3) return null;
  const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const DEFAULT_SAMPLE_EVENTS: EventItem[] = [
  {
    id: "sample-1",
    nom: "Match Championnat Senior 1 & 2 vs RC Vannes",
    type: "senior_dom",
    cat: "Seniors (Équipe 1 & 2)",
    date: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    lieu: "Stade Municipal de l'Ovalie - Terrain Honneur",
    horaire: "13h30 (Réserve) / 15h15 (Première)",
    adversaire: "Rugby Club de Vannes",
    notes: "Match capital pour la montée. Réception des partenaires à 17h30 au club house.",
    materiel: [
      { id: "m1", label: "8 ballons match Taille 5 (gonflés à 0.7 bar)", done: true },
      { id: "m2", label: "Tees de pénalité & sacs de plaquage d'échauffement", done: true },
      { id: "m3", label: "Trousse médicale FFR (cold packs, bandes élastoplaste, ciseaux)", done: false },
      { id: "m4", label: "Table de marque : chronomètre, sifflet de réserve, drapeaux de touche", done: true },
      { id: "m5", label: "2 jeux de chasubles remplaçants (orange et bleu)", done: true },
      { id: "m6", label: "Packs d'eau et gourdes nettoyées", done: false },
    ],
    todo: [
      { id: "t1", label: "Déclaration de la feuille de match sur Oval-e (FFR)", done: true },
      { id: "t2", label: "Vérifier la licence et pièce d'identité des 46 joueurs", done: false },
      { id: "t3", label: "Accueil arbitres et délégué fédéral (eau, clés vestiaire)", done: false },
      { id: "t4", label: "Mise en route de la sono et micro speaker", done: false },
      { id: "t5", label: "Commande fûts de bière buvette & frites 3e mi-temps", done: true },
    ],
    benevoles: [
      { id: "b1", poste: "Buvette & Restauration", creneau: "13h00 - 18h30", nombre: "4", lien: "https://chat.whatsapp.com/sample-buvette" },
      { id: "b2", poste: "Entrée & Billetterie", creneau: "13h00 - 15h30", nombre: "2", lien: "https://forms.gle/sample-billetterie" },
      { id: "b3", poste: "Table de marque & Chronomètre", creneau: "13h15 - 17h00", nombre: "2", lien: "" },
      { id: "b4", poste: "Speaker & Animation terrain", creneau: "14h45 - 17h15", nombre: "1", lien: "" },
    ],
    com: [
      { id: "c1", date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), quoi: "Affiche du match sur Facebook & Instagram (Visuel officiel)", lien: "https://www.canva.com" },
      { id: "c2", date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), quoi: "Annonce composition d'équipe après l'entraînement du vendredi", lien: "" },
      { id: "c3", date: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10), quoi: "Live score sur les réseaux sociaux & résumé photos", lien: "https://photos.app.goo.gl" },
    ],
  },
  {
    id: "sample-2",
    nom: "Plateau École de Rugby (EDR) U10 & U12",
    type: "edr_dom",
    cat: "École de Rugby (M8-M14)",
    date: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
    lieu: "Plaine des Jeux - Terrains 2 et 3",
    horaire: "10h00 - 13h00",
    adversaire: "4 clubs invités (Saint-Malo, Dinan, Rennes, Redon)",
    notes: "120 enfants attendus. Goûter offert à l'issue de tous les plateaux.",
    materiel: [
      { id: "m20", label: "20 ballons T3 et T4", done: true },
      { id: "m21", label: "Plots de couleur pour tracer 4 demi-terrains", done: true },
      { id: "m22", label: "4 tables pour les tables de marque et fiches de score", done: false },
      { id: "m23", label: "Goûter des enfants : 150 briques de jus, compotes et brioches", done: false },
    ],
    todo: [
      { id: "t20", label: "Envoi des fiches d'inscription aux clubs voisins", done: true },
      { id: "t21", label: "Attribution des vestiaires par club avec panneaux", done: false },
      { id: "t22", label: "Briefing éducateurs et jeunes arbitres (Cadets)", done: false },
    ],
    benevoles: [
      { id: "b20", poste: "Distribution des goûters", creneau: "11h45 - 13h15", nombre: "3", lien: "https://forms.gle/sample-gouter" },
      { id: "b21", poste: "Jeunes Arbitres M16 / Cadets", creneau: "09h45 - 12h30", nombre: "4", lien: "" },
      { id: "b22", poste: "Café d'accueil des parents & éducateurs", creneau: "09h15 - 11h00", nombre: "2", lien: "" },
    ],
    com: [
      { id: "c20", date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10), quoi: "Programme du tournoi envoyé aux familles par email", lien: "https://drive.google.com" },
    ],
  },
  {
    id: "sample-3",
    nom: "Grand Repas Aligot & Retransmission Tournoi 6 Nations",
    type: "asso_club",
    cat: "Club entier",
    date: new Date(Date.now() + 86400000 * 18).toISOString().slice(0, 10),
    lieu: "Club House & Salle Polyvalente",
    horaire: "À partir de 19h00",
    adversaire: "France vs Angleterre",
    notes: "Objectif 80 couverts. Inscription obligatoire avant le 15 du mois.",
    materiel: [
      { id: "m30", label: "Vidéoprojecteur grand écran + câble HDMI testé", done: true },
      { id: "m31", label: "Marmites traiteur & chauffe-plats aligot", done: false },
      { id: "m32", label: "Nappes, serviettes, couverts compostables", done: false },
    ],
    todo: [
      { id: "t30", label: "Réservation salle auprès du service des sports de la ville", done: true },
      { id: "t31", label: "Validation commande saucisse / aligot artisan", done: true },
      { id: "t32", label: "Playlist musique 3e mi-temps et bandas", done: false },
    ],
    benevoles: [
      { id: "b30", poste: "Service à table & plat chaud", creneau: "19h30 - 22h00", nombre: "4", lien: "https://chat.whatsapp.com/sample-service" },
      { id: "b31", poste: "Rangement et nettoyage club house", creneau: "23h30 - 01h00", nombre: "3", lien: "" },
    ],
    com: [
      { id: "c30", date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), quoi: "Visuel d'inscription HelloAsso publié", lien: "https://www.helloasso.com" },
    ],
  },
];
