import React, { useState } from "react";
import {
  EventItem,
  TYPES,
  getTypeInfo,
  calculateProgress,
  formatDateFrench,
  formatDateShort,
  isPastDate,
  getDaysRemaining,
} from "../types";
import {
  Plus,
  Shield,
  Calendar,
  Users,
  CheckSquare,
  Clock,
  MapPin,
  ArrowRight,
  Search,
  Sparkles,
  Trophy,
  Beer,
  Baby,
} from "lucide-react";

interface DashboardViewProps {
  clubName: string;
  events: EventItem[];
  onSelectEvent: (id: string) => void;
  onNewEventWithType: (type: string, category: string, defaultName: string) => void;
  onNewEvent: () => void;
  isAdmin?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clubName,
  events,
  onSelectEvent,
  onNewEventWithType,
  onNewEvent,
  isAdmin = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");

  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => !isPastDate(e.date));
  const pastEvents = events.filter((e) => isPastDate(e.date));

  // Count total volunteers required across events
  const totalVolunteersNeeded = events.reduce((acc, ev) => {
    return (
      acc +
      ev.benevoles.reduce((bAcc, b) => {
        const n = parseInt(b.nombre, 10);
        return bAcc + (isNaN(n) ? 1 : n);
      }, 0)
    );
  }, 0);

  // Average preparation
  const avgProgress =
    upcomingEvents.length > 0
      ? Math.round(
          upcomingEvents.reduce((acc, ev) => acc + calculateProgress(ev), 0) /
            upcomingEvents.length
        )
      : 0;

  // Next upcoming event
  const nextEvent = [...upcomingEvents]
    .filter((e) => e.date)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  // Filtered upcoming list
  const filteredUpcoming = upcomingEvents.filter((e) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.lieu && e.lieu.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.adversaire && e.adversaire.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat =
      selectedCatFilter === "all" || e.type === selectedCatFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#122A54] via-[#1B3B73] to-[#2C5AA6] rounded-xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,_rgba(193,39,45,0.25)_0%,_transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-rose-200 mb-2">
                <Shield className="w-3.5 h-3.5 text-[#DE4B44]" />
                Feuille de match &bull; {clubName}
              </div>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-wide">
                Tableau de bord de l'Ovalie
              </h1>
              <p className="text-sm text-slate-200/90 max-w-2xl mt-1 leading-relaxed">
                Planification des rencontres, gestion des équipements, coordination des bénévoles et suivi de communication.
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={onNewEvent}
                  className="bg-[#C1272D] hover:bg-[#DE4B44] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Ajouter un événement
                </button>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="bg-black/25 backdrop-blur-sm border border-white/10 p-3.5 rounded-lg">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-300" /> Total enregistrés
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-bold mt-1 text-white">
                {totalEvents}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {pastEvents.length} archivés
              </div>
            </div>

            <div className="bg-black/25 backdrop-blur-sm border border-white/10 p-3.5 rounded-lg">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> Prochains matchs
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-bold mt-1 text-amber-300">
                {upcomingEvents.length}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                à disputer
              </div>
            </div>

            <div className="bg-black/25 backdrop-blur-sm border border-white/10 p-3.5 rounded-lg">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-300" /> Bénévoles requis
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-bold mt-1 text-emerald-300">
                {totalVolunteersNeeded}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                buvette, table, arbitrage
              </div>
            </div>

            <div className="bg-black/25 backdrop-blur-sm border border-white/10 p-3.5 rounded-lg">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                <CheckSquare className="w-3.5 h-3.5 text-sky-300" /> Préparation
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-bold mt-1 text-sky-300">
                {avgProgress}%
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                moyenne des tâches
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prochain Rendez-vous Highlight */}
      {nextEvent && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C1272D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C1272D]"></span>
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C1272D]">
                  Prochaine échéance
                </span>
                {(() => {
                  const days = getDaysRemaining(nextEvent.date);
                  if (days === 0) {
                    return (
                      <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                        Aujourd'hui !
                      </span>
                    );
                  }
                  if (days === 1) {
                    return (
                      <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Demain
                      </span>
                    );
                  }
                  if (days !== null && days > 1) {
                    return (
                      <span className="ml-2 text-xs font-medium text-slate-500">
                        (Dans {days} jours)
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <button
              onClick={() => onSelectEvent(nextEvent.id)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#122A54] hover:text-[#C1272D] transition-colors"
            >
              Consulter la feuille complète
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getTypeInfo(nextEvent.type).color }}
                />
                <span className="text-xs font-semibold text-slate-600">
                  {getTypeInfo(nextEvent.type).label} &bull; {nextEvent.cat}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#161B22]">
                {nextEvent.nom}
              </h3>

              <div className="flex flex-wrap gap-y-2 gap-x-5 text-xs text-slate-600 mt-3">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#C1272D]" />
                  {formatDateFrench(nextEvent.date)}
                </div>
                {nextEvent.horaire && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {nextEvent.horaire}
                  </div>
                )}
                {nextEvent.lieu && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {nextEvent.lieu}
                  </div>
                )}
              </div>
            </div>

            {/* Quick summary badges */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Niveau de préparation</span>
                <span className="font-heading text-sm text-[#122A54]">
                  {calculateProgress(nextEvent)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-[#C1272D] h-full transition-all"
                  style={{ width: `${calculateProgress(nextEvent)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-1.5 rounded border border-slate-100">
                  <span className="block font-bold text-slate-800">
                    {nextEvent.materiel.filter((m) => m.done).length}/
                    {nextEvent.materiel.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Matériel</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-slate-100">
                  <span className="block font-bold text-slate-800">
                    {nextEvent.todo.filter((t) => t.done).length}/
                    {nextEvent.todo.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Tâches</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-slate-100">
                  <span className="block font-bold text-slate-800">
                    {nextEvent.benevoles.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Bénévoles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Creation Templates for Rugby Clubs - Admin only */}
      {isAdmin && (
        <div>
          <h2 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C1272D]" />
            Modèles d'événements rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() =>
                onNewEventWithType(
                  "senior_dom",
                  "Seniors (Équipe 1 & 2)",
                  "Match Senior à Domicile vs "
                )
              }
              className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 hover:border-[#122A54] rounded-lg text-left shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-md bg-[#122A54]/10 text-[#122A54] flex items-center justify-center shrink-0 group-hover:bg-[#122A54] group-hover:text-white transition-colors">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="font-heading font-bold text-slate-900 text-sm">
                  Match Senior à Domicile
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Avec feuille de match FFR, buvette &amp; arbitres
                </div>
              </div>
            </button>

            <button
              onClick={() =>
                onNewEventWithType(
                  "edr_dom",
                  "École de Rugby (M8-M14)",
                  "Plateau EDR à Domicile - "
                )
              }
              className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 hover:border-[#3E6FBE] rounded-lg text-left shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <div className="font-heading font-bold text-slate-900 text-sm">
                  Plateau EDR (Jeunes)
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Plots, ballons adaptés, goûter &amp; vestiaires
                </div>
              </div>
            </button>

            <button
              onClick={() =>
                onNewEventWithType(
                  "asso_club",
                  "Club entier",
                  "Soirée Club House & Convivialité"
                )
              }
              className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 hover:border-sky-500 rounded-lg text-left shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Beer className="w-5 h-5" />
              </div>
              <div>
                <div className="font-heading font-bold text-slate-900 text-sm">
                  Événement Club House
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Repas des supporters, retransmission, AG
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Events Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
            <span>Tous les rendez-vous à venir</span>
            <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredUpcoming.length}
            </span>
          </h2>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un match, lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#122A54] w-48 sm:w-60 shadow-sm"
              />
            </div>
          </div>
        </div>

        {filteredUpcoming.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-700">
              Aucun événement ne correspond à vos filtres.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Modifiez votre recherche ou créez une nouvelle feuille de match.
            </p>
            <button
              onClick={onNewEvent}
              className="mt-4 px-4 py-2 bg-[#122A54] text-white rounded-lg text-xs font-semibold hover:bg-[#1B3B73] transition-colors"
            >
              + Créer un nouvel événement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUpcoming.map((ev) => {
              const typeInfo = getTypeInfo(ev.type);
              const progress = calculateProgress(ev);
              const daysLeft = getDaysRemaining(ev.date);

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev.id)}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-400 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Badge & Days */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white tracking-wide"
                        style={{ backgroundColor: typeInfo.color }}
                      >
                        {typeInfo.label}
                      </span>
                      {daysLeft !== null && (
                        <span className="text-[11px] font-semibold text-slate-500">
                          {daysLeft === 0
                            ? "Aujourd'hui"
                            : daysLeft === 1
                            ? "Demain"
                            : `J-${daysLeft}`}
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-slate-900 text-base leading-snug group-hover:text-[#122A54] transition-colors line-clamp-2">
                      {ev.nom || "Sans titre"}
                    </h3>

                    <div className="space-y-1 mt-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-[#C1272D]" />
                        <span>{formatDateFrench(ev.date)}</span>
                      </div>
                      {ev.lieu && (
                        <div className="flex items-center gap-1.5 truncate text-slate-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{ev.lieu}</span>
                        </div>
                      )}
                      {ev.cat && (
                        <div className="text-[11px] text-slate-400">
                          Catégorie: {ev.cat}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress & Bottom Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">
                        Préparation
                      </span>
                      <span className="font-bold text-slate-700">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#122A54] group-hover:bg-[#C1272D] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2">
                      <span>{ev.benevoles.length} bénévoles</span>
                      <span className="text-[#122A54] group-hover:translate-x-0.5 transition-transform font-semibold flex items-center gap-1">
                        Ouvrir &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
