import React, { useState } from "react";
import {
  TYPES,
  EventItem,
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
}) => {
  const [showPast, setShowPast] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

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

        {/* Sync badge */}
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Enregistré sur cet appareil
          </span>
          <button
            onClick={onOpenBackupModal}
            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 hover:underline"
            title="Exporter / Importer les données"
          >
            Sauvegardes
          </button>
        </div>
      </div>

      {/* Main Action: New Event */}
      <div className="p-4 pb-2">
        <button
          onClick={onNewEvent}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-[#C1272D] hover:bg-[#DE4B44] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Nouvel événement</span>
        </button>
      </div>

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

      {/* Filters */}
      <div className="px-4 py-2 border-b border-white/10">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-2">
          <span className="flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtrer par type
          </span>
          {filterType !== "all" && (
            <button
              onClick={() => onSelectFilter("all")}
              className="text-rose-300 hover:text-rose-200 lowercase text-[10px]"
            >
              réinitialiser
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectFilter("all")}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
              filterType === "all"
                ? "bg-white text-[#122A54] font-bold border-white"
                : "bg-white/5 text-slate-300 border-white/20 hover:bg-white/10 hover:text-white"
            }`}
          >
            Tous ({events.length})
          </button>
          {TYPES.map((t) => {
            const count = events.filter((e) => e.type === t.id).length;
            const active = filterType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectFilter(t.id)}
                className={`text-[11px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-white text-[#122A54] font-bold border-white"
                    : "bg-white/5 text-slate-300 border-white/15 hover:bg-white/10 hover:text-white"
                }`}
                title={t.description}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <span className="truncate max-w-[120px]">{t.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Upcoming Section */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span>À venir ({upcomingEvents.length})</span>
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
        🏉 Rugby Club Planner &bull; FFR ready
      </div>
    </aside>
  );
};
