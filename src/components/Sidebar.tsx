import React, { useState } from "react";
import { User } from "firebase/auth";
import {
  TYPES,
  EventItem,
  UserProfile,
  formatDateShort,
  calculateProgress,
  isPastDate,
  getTypeInfo,
} from "../types";
import {
  Plus,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Filter,
  Shield,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  LogIn,
  LogOut,
  Cloud,
  CloudCheck,
  Users,
} from "lucide-react";

interface SidebarProps {
  clubName: string;
  onClubNameChange: (name: string) => void;
  currentView: "dashboard" | "calendar";
  onSelectView: (view: "dashboard" | "calendar") => void;
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
  filterType: string;
  onSelectFilter: (typeId: string) => void;
  events: EventItem[];
  onNewEvent: () => void;
  onOpenBackupModal: () => void;
  currentUser: User | null;
  currentUserProfile: UserProfile | null;
  pendingUsersCount: number;
  onOpenUserManagement: () => void;
  onLoginGoogle: () => void;
  onLogoutGoogle: () => void;
  isFirestoreLive: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  clubName,
  onClubNameChange,
  currentView,
  onSelectView,
  selectedEventId,
  onSelectEvent,
  filterType,
  onSelectFilter,
  events,
  onNewEvent,
  onOpenBackupModal,
  currentUser,
  currentUserProfile,
  pendingUsersCount,
  onOpenUserManagement,
  onLoginGoogle,
  onLogoutGoogle,
  isFirestoreLive,
}) => {
  const [showPast, setShowPast] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const isAdmin = currentUserProfile?.role === "Admin";
  const isJoueur = currentUserProfile?.role === "Joueur";

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (filterType === "all") return true;
    return e.type === filterType;
  });

  // Sort by date
  const sorted = [...filteredEvents].sort((a, b) => {
    return (a.date || "9999").localeCompare(b.date || "9999");
  });

  const upcomingEvents = sorted.filter((e) => !isPastDate(e.date));
  const pastEvents = sorted.filter((e) => isPastDate(e.date)).reverse();

  return (
    <aside className="w-full md:w-80 lg:w-84 shrink-0 bg-[#122A54] text-[#F4F5F7] flex flex-col h-full min-h-screen md:sticky md:top-0 md:h-screen shadow-xl z-20">
      {/* Club Header & Crest */}
      <div className="p-5 pb-4 border-b border-white/10 bg-[#0E2040]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-lg bg-[#C1272D] flex items-center justify-center font-heading text-2xl font-bold text-white shadow-md border border-white/20">
            15
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs tracking-wider uppercase font-semibold text-rose-300 flex items-center gap-1.5">
              <Shield className="w-3 h-3 inline" />
              Feuille de match
            </div>
            <input
              type="text"
              value={clubName}
              onChange={(e) => onClubNameChange(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 hover:border-white/50 focus:border-[#DE4B44] text-white font-heading text-xl font-bold tracking-wide outline-none pb-0.5 transition-colors"
              title="Cliquer pour modifier le nom du club"
              placeholder="Nom du club de rugby"
            />
          </div>
        </div>

        <p className="text-xs text-slate-300/80 leading-relaxed">
          Organisation des matchs, tournois, bénévoles &amp; matériel
        </p>

        {/* Sync badge with Firestore Status */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              isFirestoreLive
                ? "bg-sky-500/20 text-sky-200 border-sky-400/30"
                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isFirestoreLive ? "bg-sky-400" : "bg-emerald-400"
              } animate-pulse`}
            ></span>
            {isFirestoreLive ? "☁️ Firestore en direct" : "Enregistré localement"}
          </span>
          <button
            onClick={onOpenBackupModal}
            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 hover:underline"
            title="Exporter / Importer les données"
          >
            Sauvegardes
          </button>
        </div>

        {/* User Account / Role / Google Sign-In */}
        <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2">
          {currentUser ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "Utilisateur"}
                      className="w-7 h-7 rounded-full border border-white/30 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {currentUser.email ? currentUser.email[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate leading-tight">
                      {currentUser.displayName || currentUser.email}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                          currentUserProfile?.role === "Admin"
                            ? "bg-rose-500 text-white"
                            : currentUserProfile?.role === "Benevole"
                            ? "bg-amber-400 text-slate-900"
                            : "bg-sky-400 text-slate-900"
                        }`}
                      >
                        {currentUserProfile?.role || "Membre"}
                      </span>
                      <span className="text-[10px] text-emerald-300">
                        &bull; Validé
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onLogoutGoogle}
                  className="text-slate-400 hover:text-rose-300 p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Admin Button: Manage Members & Approvals */}
              {isAdmin && (
                <button
                  onClick={onOpenUserManagement}
                  className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold transition-colors border border-white/10 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-rose-300" />
                    Membres du club
                  </span>
                  {pendingUsersCount > 0 ? (
                    <span className="bg-amber-500 text-slate-900 font-bold text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
                      {pendingUsersCount} en attente
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Gérer &rarr;</span>
                  )}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onLoginGoogle}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors cursor-pointer"
            >
              <LogIn className="w-3 h-3 text-sky-300" />
              Se connecter avec Google
            </button>
          )}
        </div>
      </div>

      {/* Main Action: New Event (Visible strictly to Admins) */}
      {isAdmin && (
        <div className="p-4 pb-2">
          <button
            onClick={onNewEvent}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-[#C1272D] hover:bg-[#DE4B44] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouvel événement</span>
          </button>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-2 gap-1.5 bg-black/25 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => {
              onSelectView("dashboard");
              onSelectEvent(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-semibold transition-all ${
              currentView === "dashboard" && selectedEventId === null
                ? "bg-white text-[#122A54] shadow"
                : "text-slate-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Tableau de bord
          </button>
          <button
            onClick={() => {
              onSelectView("calendar");
              onSelectEvent(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-semibold transition-all ${
              currentView === "calendar" && selectedEventId === null
                ? "bg-white text-[#122A54] shadow"
                : "text-slate-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendrier
          </button>
        </div>
      </div>

      {/* Events List Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Upcoming Section with integrated Filter Dropdown */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 shrink-0">
              À venir ({upcomingEvents.length})
            </span>

            {/* Filter Dropdown - Compact */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => onSelectFilter(e.target.value)}
                className={`text-[10px] font-medium pl-1.5 pr-4 py-0.5 rounded border appearance-none cursor-pointer transition-all outline-none max-w-[125px] truncate ${
                  filterType !== "all"
                    ? "bg-white text-[#122A54] border-white shadow-2xs font-bold"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
                title="Filtrer les événements par catégorie"
              >
                <option value="all" className="bg-[#122A54] text-white">
                  Tous ({events.length})
                </option>
                {TYPES.map((t) => {
                  const count = events.filter((e) => e.type === t.id).length;
                  return (
                    <option key={t.id} value={t.id} className="bg-[#122A54] text-white">
                      {t.label} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                className={`w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                  filterType !== "all" ? "text-[#122A54]" : "text-slate-400"
                }`}
              />
            </div>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400 border border-dashed border-white/15 rounded bg-white/5">
              Aucun événement à venir.
              <br />
              <button
                onClick={onNewEvent}
                className="text-[#DE4B44] hover:underline font-medium mt-1 inline-block"
              >
                Créer une date
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((ev) => {
                const isSelected = selectedEventId === ev.id;
                const progress = calculateProgress(ev);
                const typeInfo = getTypeInfo(ev.type);

                return (
                  <button
                    key={ev.id}
                    onClick={() => {
                      onSelectEvent(ev.id);
                    }}
                    className={`w-full text-left p-2.5 rounded transition-all border-l-4 relative group ${
                      isSelected
                        ? "bg-white/20 border-white text-white shadow-md"
                        : "bg-white/5 hover:bg-white/10 text-slate-200"
                    }`}
                    style={{ borderLeftColor: isSelected ? "#FFFFFF" : typeInfo.color }}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#DE4B44]">
                      <span>{formatDateShort(ev.date)}</span>
                      <span className="text-[10px] text-slate-300">
                        {progress}% prêt
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white leading-tight mt-0.5 line-clamp-1">
                      {ev.nom || "Sans titre"}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: typeInfo.color }}
                      />
                      <span className="truncate">{typeInfo.label}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-white/15 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#DE4B44] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Section */}
        {pastEvents.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => setShowPast(!showPast)}
              className="w-full flex items-center justify-between text-[11px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200 py-1"
            >
              <span>Événements passés ({pastEvents.length})</span>
              {showPast ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showPast && (
              <div className="space-y-1.5 mt-2">
                {pastEvents.map((ev) => {
                  const isSelected = selectedEventId === ev.id;
                  const typeInfo = getTypeInfo(ev.type);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onSelectEvent(ev.id)}
                      className={`w-full text-left p-2 rounded text-xs opacity-70 hover:opacity-100 transition-all border-l-2 ${
                        isSelected
                          ? "bg-white/20 border-white text-white opacity-100"
                          : "bg-white/5 hover:bg-white/10 text-slate-300"
                      }`}
                      style={{ borderLeftColor: typeInfo.color }}
                    >
                      <div className="text-[10px] text-slate-400">
                        {formatDateShort(ev.date)}
                      </div>
                      <div className="font-medium text-slate-200 truncate">
                        {ev.nom}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-3 border-t border-white/10 text-center text-[11px] text-slate-400 bg-black/20">
        🏉 {clubName}
      </div>
    </aside>
  );
};
