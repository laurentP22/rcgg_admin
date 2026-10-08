import React, { useState } from "react";
import {
  EventItem,
  TYPES,
  CATS,
  getTypeInfo,
  calculateProgress,
  formatDateFrench,
  uid,
} from "../types";
import {
  ArrowLeft,
  Trash2,
  Printer,
  Copy,
  Plus,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Shield,
  CheckCircle2,
  Circle,
  Sparkles,
  Share2,
  FileText,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface EventDetailViewProps {
  event: EventItem;
  clubName: string;
  onUpdateEvent: (updated: EventItem) => void;
  onDeleteEvent: (id: string) => void;
  onBack: () => void;
  onPrint: () => void;
  onDuplicate: (event: EventItem) => void;
  onShowToast: (msg: string) => void;
  isAdmin?: boolean;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  event,
  clubName,
  onUpdateEvent,
  onDeleteEvent,
  onBack,
  onPrint,
  onDuplicate,
  onShowToast,
  isAdmin = false,
}) => {
  // New item inputs
  const [newMaterielText, setNewMaterielText] = useState("");
  const [newTodoText, setNewTodoText] = useState("");

  // Volunteer form state
  const [volunteerPoste, setVolunteerPoste] = useState("");
  const [volunteerCreneau, setVolunteerCreneau] = useState("");
  const [volunteerNombre, setVolunteerNombre] = useState("2");
  const [volunteerLien, setVolunteerLien] = useState("");

  // Communication form state
  const [comDate, setComDate] = useState("");
  const [comQuoi, setComQuoi] = useState("");
  const [comLien, setComLien] = useState("");

  const typeInfo = getTypeInfo(event.type);
  const progress = calculateProgress(event);

  // Updates
  const updateField = <K extends keyof EventItem>(key: K, value: EventItem[K]) => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    onUpdateEvent({ ...event, [key]: value });
  };

  // Checklists handlers
  const toggleChecklist = (section: "materiel" | "todo", itemId: string) => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    const updated = event[section].map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdateEvent({ ...event, [section]: updated });
  };

  const removeChecklistItem = (section: "materiel" | "todo", itemId: string) => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    const updated = event[section].filter((item) => item.id !== itemId);
    onUpdateEvent({ ...event, [section]: updated });
  };

  const addChecklistItem = (section: "materiel" | "todo", text: string) => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    const newItem = { id: uid(), label: trimmed, done: false };
    onUpdateEvent({ ...event, [section]: [...event[section], newItem] });
    if (section === "materiel") setNewMaterielText("");
    if (section === "todo") setNewTodoText("");
  };

  // Preset rugby packs
  const addRugbyGearPreset = () => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    const preset = [
      "8 Ballons T5 gonflés (0.7 bar)",
      "Tee de pénalité & plot d'échauffement",
      "Trousse médicale FFR (cold packs, strap, ciseaux)",
      "Table de marque (chronomètre, sifflet de secours)",
      "2 jeux de chasubles remplaçants",
      "Gourdes d'eau fraîche & casiers",
    ];
    const existingLabels = new Set(event.materiel.map((m) => m.label.toLowerCase()));
    const toAdd = preset
      .filter((p) => !existingLabels.has(p.toLowerCase()))
      .map((p) => ({ id: uid(), label: p, done: false }));

    if (toAdd.length === 0) {
      onShowToast("Le pack matériel standard est déjà présent");
      return;
    }
    onUpdateEvent({ ...event, materiel: [...event.materiel, ...toAdd] });
    onShowToast(`${toAdd.length} éléments matériel ajoutés`);
  };

  const addRugbyTaskPreset = () => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    const preset = [
      "Déclaration feuille de match Oval-e (FFR)",
      "Vérification licences & pièces d'identité",
      "Clés & préparation des vestiaires (visiteurs & arbitre)",
      "Accueil arbitre & délégué fédéral",
      "Approvisionnement buvette & casse-croûte 3e mi-temps",
    ];
    const existingLabels = new Set(event.todo.map((t) => t.label.toLowerCase()));
    const toAdd = preset
      .filter((p) => !existingLabels.has(p.toLowerCase()))
      .map((p) => ({ id: uid(), label: p, done: false }));

    if (toAdd.length === 0) {
      onShowToast("Le pack administratif est déjà présent");
      return;
    }
    onUpdateEvent({ ...event, todo: [...event.todo, ...toAdd] });
    onShowToast(`${toAdd.length} tâches logistiques ajoutées`);
  };

  // Volunteer handlers
  const addVolunteer = () => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    if (!volunteerPoste.trim()) {
      onShowToast("Veuillez indiquer au moins le titre du poste");
      return;
    }
    const newVol = {
      id: uid(),
      poste: volunteerPoste.trim(),
      creneau: volunteerCreneau.trim() || "Horaires à définir",
      nombre: volunteerNombre.trim() || "1",
      lien: volunteerLien.trim(),
    };
    onUpdateEvent({ ...event, benevoles: [...event.benevoles, newVol] });
    setVolunteerPoste("");
    setVolunteerCreneau("");
    setVolunteerLien("");
    onShowToast("Poste bénévole ajouté");
  };

  const removeVolunteer = (id: string) => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    const updated = event.benevoles.filter((b) => b.id !== id);
    onUpdateEvent({ ...event, benevoles: updated });
  };

  const copyWhatsAppVolunteerMessage = () => {
    if (event.benevoles.length === 0) {
      onShowToast("Aucun poste bénévole à partager pour le moment");
      return;
    }
    const lines = [
      `🏉 *${clubName.toUpperCase()}* - Appel aux bénévoles !`,
      `📅 *${event.nom}*`,
      `🗓 Date: ${formatDateFrench(event.date)}`,
      event.lieu ? `📍 Lieu: ${event.lieu}` : "",
      event.horaire ? `⏰ Horaire: ${event.horaire}` : "",
      "",
      "📋 *Postes recherchés :*",
      ...event.benevoles.map(
        (b) => `• *${b.poste}* (${b.creneau}) - ${b.nombre} personne(s)${b.lien ? ` 👉 Lien : ${b.lien}` : ""}`
      ),
      "",
      "Merci pour votre engagement au club ! Vive le rugby 🏉❤️",
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    onShowToast("Message WhatsApp copié dans le presse-papier !");
  };

  // Com handlers
  const addCommunication = () => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    if (!comQuoi.trim()) {
      onShowToast("Veuillez préciser l'action de communication");
      return;
    }
    const newCom = {
      id: uid(),
      date: comDate,
      quoi: comQuoi.trim(),
      lien: comLien.trim(),
    };
    onUpdateEvent({ ...event, com: [...event.com, newCom] });
    setComQuoi("");
    setComLien("");
    onShowToast("Action de communication ajoutée");
  };

  const removeCommunication = (id: string) => {
    if (!isAdmin) {
      onShowToast("Modification réservée aux administrateurs");
      return;
    }
    const updated = event.com.filter((c) => c.id !== id);
    onUpdateEvent({ ...event, com: updated });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour au tableau de bord
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {!isAdmin && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Mode consultation (Modifications réservées à l'administrateur)
            </span>
          )}

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#122A54] bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
            title="Imprimer la feuille de route pour le match"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer la feuille
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onDuplicate(event)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
                title="Dupliquer cet événement"
              >
                <Copy className="w-3.5 h-3.5" />
                Dupliquer
              </button>

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Supprimer définitivement l'événement "${event.nom}" ?`
                    )
                  ) {
                    onDeleteEvent(event.id);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B3B2D] bg-white border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Event Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
        {/* Title and Badge */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-xs"
              style={{ backgroundColor: typeInfo.color }}
            >
              {typeInfo.label}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Catégorie : {event.cat}
            </span>
          </div>

          {isAdmin ? (
            <input
              type="text"
              value={event.nom}
              onChange={(e) => updateField("nom", e.target.value)}
              placeholder="Nom de la rencontre / événement"
              className="w-full font-heading text-2xl sm:text-3xl font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-[#122A54] outline-none pb-1 transition-colors"
            />
          ) : (
            <h1 className="w-full font-heading text-2xl sm:text-3xl font-bold text-slate-900 pb-1">
              {event.nom || "Sans titre"}
            </h1>
          )}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          {/* Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Type d'événement
            </label>
            <select
              disabled={!isAdmin}
              value={event.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="w-full bg-white disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed border border-slate-200 rounded p-2 text-slate-800 font-medium focus:outline-none focus:border-[#122A54]"
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Catégorie FFR
            </label>
            <select
              disabled={!isAdmin}
              value={event.cat}
              onChange={(e) => updateField("cat", e.target.value)}
              className="w-full bg-white disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed border border-slate-200 rounded p-2 text-slate-800 font-medium focus:outline-none focus:border-[#122A54]"
            >
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Date de l'événement
            </label>
            <input
              type="date"
              disabled={!isAdmin}
              value={event.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="w-full bg-white disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed border border-slate-200 rounded p-2 text-slate-800 font-medium focus:outline-none focus:border-[#122A54]"
            />
          </div>

          {/* Kickoff / Horaire */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Horaire / Coup d'envoi
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              placeholder="ex: 13h30 (Réserve) / 15h15 (Première)"
              value={event.horaire || ""}
              onChange={(e) => updateField("horaire", e.target.value)}
              className="w-full bg-white disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed border border-slate-200 rounded p-2 text-slate-800 focus:outline-none focus:border-[#122A54]"
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Lieu / Stade
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              placeholder="ex: Stade Municipal, Terrain Honneur"
              value={event.lieu}
              onChange={(e) => updateField("lieu", e.target.value)}
              className="w-full bg-white disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed border border-slate-200 rounded p-2 text-slate-800 focus:outline-none focus:border-[#122A54]"
            />
          </div>

          {/* Adversaire */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Adversaire / Clubs invités
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              placeholder="ex: Stade Bordelais ou 4 clubs invités"
              value={event.adversaire || ""}
              onChange={(e) => updateField("adversaire", e.target.value)}
              className="w-full bg-white disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed border border-slate-200 rounded p-2 text-slate-800 focus:outline-none focus:border-[#122A54]"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Consignes spécifiques &bull; Bureau, éducateurs &amp; dirigeants
            </label>
            <textarea
              rows={2}
              disabled={!isAdmin}
              placeholder="Notes logistiques, code vestiaire, protocole partenaires, particularités règlementaires..."
              value={event.notes || ""}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full bg-white disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed border border-slate-200 rounded p-2 text-slate-800 focus:outline-none focus:border-[#122A54]"
            />
          </div>
        </div>

        {/* Global Progress Gauge */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/70">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              Avancement de la préparation
            </span>
            <span className="font-heading font-bold text-sm text-[#122A54]">
              {progress}% préparé
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#122A54] to-[#C1272D] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* SECTION: Besoins Matériels */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                1. Besoins Matériels &amp; Équipement
              </h3>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                {event.materiel.filter((m) => m.done).length} /{" "}
                {event.materiel.length}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={addRugbyGearPreset}
                className="text-xs font-semibold text-[#122A54] hover:text-[#C1272D] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Insérer pack matériel rugby
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 italic">
            Ballons de match, chasubles remplaçants, trousse de secours, table de marque, tees, pharmacie...
          </p>

          <div className="space-y-1.5">
            {event.materiel.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  item.done
                    ? "bg-slate-50 border-slate-200 text-slate-400"
                    : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs"
                }`}
              >
                <label className={`flex items-center gap-3 flex-1 min-w-0 ${isAdmin ? "cursor-pointer" : "cursor-default"}`}>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={item.done}
                    onChange={() => toggleChecklist("materiel", item.id)}
                    className="w-4 h-4 accent-[#122A54] rounded disabled:cursor-not-allowed shrink-0"
                  />
                  <span
                    className={`text-sm ${
                      item.done ? "line-through text-slate-400" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </label>

                {isAdmin && (
                  <button
                    onClick={() => removeChecklistItem("materiel", item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                    title="Supprimer cet élément"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add item input - Admin only */}
          {isAdmin && (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Ajouter un équipement (ex. 10 plots de pénalité, glace fraîche...)"
                value={newMaterielText}
                onChange={(e) => setNewMaterielText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addChecklistItem("materiel", newMaterielText);
                  }
                }}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#122A54]"
              />
              <button
                onClick={() => addChecklistItem("materiel", newMaterielText)}
                className="bg-[#122A54] hover:bg-[#1B3B73] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Ajouter
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Tâches à faire */}
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                2. À Faire &bull; Logistique &amp; Administratif
              </h3>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                {event.todo.filter((t) => t.done).length} / {event.todo.length}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={addRugbyTaskPreset}
                className="text-xs font-semibold text-[#122A54] hover:text-[#C1272D] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Insérer pack logistique FFR
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 italic">
            Feuille Oval-e, vestiaires arbitres, réception délégué fédéral, commande buvette, mairie...
          </p>

          <div className="space-y-1.5">
            {event.todo.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  item.done
                    ? "bg-slate-50 border-slate-200 text-slate-400"
                    : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs"
                }`}
              >
                <label className={`flex items-center gap-3 flex-1 min-w-0 ${isAdmin ? "cursor-pointer" : "cursor-default"}`}>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={item.done}
                    onChange={() => toggleChecklist("todo", item.id)}
                    className="w-4 h-4 accent-[#122A54] rounded disabled:cursor-not-allowed shrink-0"
                  />
                  <span
                    className={`text-sm ${
                      item.done ? "line-through text-slate-400" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </label>

                {isAdmin && (
                  <button
                    onClick={() => removeChecklistItem("todo", item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                    title="Supprimer cette tâche"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add task input - Admin only */}
          {isAdmin && (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Ajouter une tâche (ex. Déclaration buvette en mairie, test sono...)"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addChecklistItem("todo", newTodoText);
                  }
                }}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#122A54]"
              />
              <button
                onClick={() => addChecklistItem("todo", newTodoText)}
                className="bg-[#122A54] hover:bg-[#1B3B73] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Ajouter
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Bénévoles */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                3. Besoins Humains &bull; Bénévoles &amp; Dirigeants
              </h3>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                {event.benevoles.length} poste(s)
              </span>
            </div>

            <button
              onClick={copyWhatsAppVolunteerMessage}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Générer et copier le texte pour le groupe WhatsApp du club"
            >
              <Share2 className="w-3.5 h-3.5" />
              Copier le message pour WhatsApp
            </button>
          </div>

          <p className="text-xs text-slate-500 italic">
            Buvette, table de marque, entrée/billetterie, sécurité, arbitrage EDR... Collez le lien WhatsApp ou Google Forms pour les inscriptions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {event.benevoles.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-heading font-bold text-base text-slate-900">
                        {b.poste}
                      </div>
                      <div className="text-xs font-semibold text-[#C1272D] uppercase tracking-wide mt-0.5">
                        {b.creneau}
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => removeVolunteer(b.id)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Supprimer ce poste"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  {b.nombre && (
                    <div className="text-xs text-slate-600 mt-2 font-medium">
                      👥 {b.nombre} bénévole(s) nécessaire(s)
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  {b.lien ? (
                    <a
                      href={b.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#122A54] hover:text-[#C1272D] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ouvrir le formulaire / sondage WhatsApp
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Pas de lien d'inscription renseigné
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Volunteer Form - Admin only */}
          {isAdmin && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ajouter un créneau bénévole
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  placeholder="Poste (ex. Buvette, Billetterie...)"
                  value={volunteerPoste}
                  onChange={(e) => setVolunteerPoste(e.target.value)}
                  className="bg-white border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-[#122A54]"
                />
                <input
                  type="text"
                  placeholder="Créneau (ex. 13h30 - 17h00)"
                  value={volunteerCreneau}
                  onChange={(e) => setVolunteerCreneau(e.target.value)}
                  className="bg-white border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-[#122A54]"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Nombre requis"
                  value={volunteerNombre}
                  onChange={(e) => setVolunteerNombre(e.target.value)}
                  className="bg-white border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-[#122A54]"
                />
                <input
                  type="text"
                  placeholder="Lien WhatsApp ou Google Forms"
                  value={volunteerLien}
                  onChange={(e) => setVolunteerLien(e.target.value)}
                  className="bg-white border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-[#122A54]"
                />
              </div>
              <button
                onClick={addVolunteer}
                className="bg-[#122A54] hover:bg-[#1B3B73] text-white px-4 py-2 rounded text-xs font-semibold shadow-xs cursor-pointer"
              >
                Ajouter le poste
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Communication */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                4. Point Communication &bull; Médias &amp; Réseaux
              </h3>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                {event.com.length} action(s)
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            Ce qui doit sortir et quand : affiche Canva, composition d'équipe Instagram, convocation, live score, presse locale...
          </p>

          <div className="space-y-2">
            {event.com.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#C1272D]">
                    {c.date ? formatDateFrench(c.date) : "Date à définir"}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {c.quoi}
                  </div>
                  {c.lien && (
                    <a
                      href={c.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#122A54] hover:underline mt-1 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Voir le fichier / maquette (Canva / Drive / Cloud)
                    </a>
                  )}
                </div>

                {isAdmin && (
                  <button
                    onClick={() => removeCommunication(c.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                    title="Supprimer cette action"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Com Form - Admin only */}
          {isAdmin && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ajouter une action de communication
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="date"
                  value={comDate}
                  onChange={(e) => setComDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-[#122A54]"
                />
                <input
                  type="text"
                  placeholder="Lien (Canva, Google Drive, page Facebook...)"
                  value={comLien}
                  onChange={(e) => setComLien(e.target.value)}
                  className="bg-white border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-[#122A54]"
                />
                <input
                  type="text"
                  placeholder="Description (ex. Visuel composition d'équipe sur Instagram jeudi à 20h)"
                  value={comQuoi}
                  onChange={(e) => setComQuoi(e.target.value)}
                  className="sm:col-span-2 bg-white border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-[#122A54]"
                />
              </div>
              <button
                onClick={addCommunication}
                className="bg-[#122A54] hover:bg-[#1B3B73] text-white px-4 py-2 rounded text-xs font-semibold shadow-xs cursor-pointer"
              >
                Ajouter l'action com
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
