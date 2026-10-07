import React, { useState, useEffect } from "react";
import {
  EventItem,
  DEFAULT_SAMPLE_EVENTS,
  uid,
  TYPES,
  CATS,
} from "./types";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { CalendarView } from "./components/CalendarView";
import { EventDetailView } from "./components/EventDetailView";
import { PrintSheetModal } from "./components/PrintSheetModal";
import { DataBackupModal } from "./components/DataBackupModal";
import { Menu, X, Shield, Plus, Calendar as CalendarIcon, LayoutDashboard } from "lucide-react";

const STORAGE_KEY = "rugby_planner_v1";

export default function App() {
  // Initialize state with localStorage or sample data
  const [clubName, setClubName] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.clubName) return parsed.clubName;
      }
    } catch (e) {
      console.error("Erreur de lecture du stockage", e);
    }
    return "Rugby Club de l'Ovalie";
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.events) && parsed.events.length > 0) {
          // Migration of legacy type IDs if any
          const migrate: Record<string, string> = {
            match_dom: "senior_dom",
            match_ext: "senior_ext",
            tournoi: "edr_dom",
            asso: "asso_club",
          };
          return parsed.events.map((e: any) => ({
            ...e,
            type: migrate[e.type] || e.type || "senior_dom",
            cat: e.cat || "Seniors",
            materiel: Array.isArray(e.materiel) ? e.materiel : [],
            todo: Array.isArray(e.todo) ? e.todo : [],
            benevoles: Array.isArray(e.benevoles) ? e.benevoles : [],
            com: Array.isArray(e.com) ? e.com : [],
          }));
        }
      }
    } catch (e) {
      console.error("Erreur de lecture du stockage", e);
    }
    return DEFAULT_SAMPLE_EVENTS;
  });

  const [currentView, setCurrentView] = useState<"dashboard" | "calendar">("dashboard");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persist to local storage whenever clubName or events change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ clubName, events })
      );
    } catch (e) {
      console.error("Impossible de sauvegarder dans localStorage", e);
    }
  }, [clubName, events]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2400);
  };

  // Helper to create a new event
  const createNewEvent = (customDate?: string): EventItem => {
    const today = new Date();
    const defaultDate = customDate || today.toISOString().slice(0, 10);
    return {
      id: uid(),
      nom: "Nouvelle rencontre",
      type: "senior_dom",
      cat: "Seniors (Équipe 1 & 2)",
      date: defaultDate,
      lieu: "Stade Municipal",
      horaire: "15h00",
      adversaire: "",
      notes: "",
      materiel: [
        { id: uid(), label: "Ballons de match T5", done: false },
        { id: uid(), label: "Trousse médicale et packs de froid", done: false },
        { id: uid(), label: "Chasubles remplaçants", done: false },
      ],
      todo: [
        { id: uid(), label: "Feuille de match Oval-e FFR", done: false },
        { id: uid(), label: "Clés des vestiaires et accueil arbitre", done: false },
      ],
      benevoles: [
        { id: uid(), poste: "Buvette", creneau: "14h00 - 18h00", nombre: "2", lien: "" },
      ],
      com: [],
    };
  };

  const handleNewEvent = () => {
    const fresh = createNewEvent();
    setEvents((prev) => [fresh, ...prev]);
    setSelectedEventId(fresh.id);
    setMobileMenuOpen(false);
    showToast("Nouvel événement créé");
  };

  const handleNewEventWithType = (type: string, category: string, defaultName: string) => {
    const fresh = createNewEvent();
    fresh.type = type;
    fresh.cat = category;
    fresh.nom = defaultName;
    setEvents((prev) => [fresh, ...prev]);
    setSelectedEventId(fresh.id);
    setMobileMenuOpen(false);
    showToast("Nouvel événement créé à partir du modèle");
  };

  const handleNewEventForDate = (dateIso: string) => {
    const fresh = createNewEvent(dateIso);
    setEvents((prev) => [fresh, ...prev]);
    setSelectedEventId(fresh.id);
    showToast(`Événement créé pour le ${dateIso}`);
  };

  const handleUpdateEvent = (updated: EventItem) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (selectedEventId === id) {
      setSelectedEventId(null);
    }
    showToast("Événement supprimé");
  };

  const handleDuplicateEvent = (target: EventItem) => {
    const clone: EventItem = {
      ...target,
      id: uid(),
      nom: `${target.nom} (Copie)`,
      materiel: target.materiel.map((m) => ({ ...m, id: uid(), done: false })),
      todo: target.todo.map((t) => ({ ...t, id: uid(), done: false })),
      benevoles: target.benevoles.map((b) => ({ ...b, id: uid() })),
      com: target.com.map((c) => ({ ...c, id: uid() })),
    };
    setEvents((prev) => [clone, ...prev]);
    setSelectedEventId(clone.id);
    showToast("Événement dupliqué");
  };

  const handleImportData = (newClubName: string, newEvents: EventItem[]) => {
    setClubName(newClubName);
    setEvents(newEvents);
    setSelectedEventId(null);
    showToast("Données importées avec succès");
  };

  const handleResetData = () => {
    setClubName("Rugby Club de l'Ovalie");
    setEvents(DEFAULT_SAMPLE_EVENTS);
    setSelectedEventId(null);
    showToast("Exemples de démonstration restaurés");
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#161B22] flex flex-col md:flex-row font-sans selection:bg-[#DE4B44] selection:text-white">
      {/* Mobile Header Bar */}
      <div className="md:hidden no-print bg-[#122A54] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#C1272D] flex items-center justify-center font-heading text-lg font-bold text-white shadow-xs">
            15
          </div>
          <div>
            <div className="font-heading font-bold text-base leading-tight truncate max-w-[180px]">
              {clubName}
            </div>
            <div className="text-[10px] text-slate-300">Feuille de match rugby</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewEvent}
            className="p-1.5 bg-[#C1272D] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded text-slate-200 cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop or Mobile Drawer */}
      <div
        className={`no-print ${
          mobileMenuOpen ? "block fixed inset-0 z-40 overflow-y-auto" : "hidden md:block"
        }`}
      >
        <Sidebar
          clubName={clubName}
          onClubNameChange={setClubName}
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            setSelectedEventId(null);
            setMobileMenuOpen(false);
          }}
          selectedEventId={selectedEventId}
          onSelectEvent={(id) => {
            setSelectedEventId(id);
            setMobileMenuOpen(false);
          }}
          filterType={filterType}
          onSelectFilter={setFilterType}
          events={events}
          onNewEvent={handleNewEvent}
          onOpenBackupModal={() => setBackupModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {selectedEvent ? (
          <EventDetailView
            event={selectedEvent}
            clubName={clubName}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onBack={() => setSelectedEventId(null)}
            onPrint={() => setPrintModalOpen(true)}
            onDuplicate={handleDuplicateEvent}
            onShowToast={showToast}
          />
        ) : currentView === "calendar" ? (
          <CalendarView
            events={events}
            onSelectEvent={(id) => setSelectedEventId(id)}
            onNewEventForDate={handleNewEventForDate}
          />
        ) : (
          <DashboardView
            clubName={clubName}
            events={events}
            onSelectEvent={(id) => setSelectedEventId(id)}
            onNewEventWithType={handleNewEventWithType}
            onNewEvent={handleNewEvent}
          />
        )}
      </main>

      {/* Print Sheet Modal */}
      {printModalOpen && (
        <PrintSheetModal
          event={selectedEvent}
          clubName={clubName}
          onClose={() => setPrintModalOpen(false)}
        />
      )}

      {/* Data Backup Modal */}
      {backupModalOpen && (
        <DataBackupModal
          isOpen={backupModalOpen}
          onClose={() => setBackupModalOpen(false)}
          clubName={clubName}
          events={events}
          onImportData={handleImportData}
          onResetData={handleResetData}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#161B22] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-white/10 animate-bounce duration-300">
          <Shield className="w-3.5 h-3.5 text-[#DE4B44]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
