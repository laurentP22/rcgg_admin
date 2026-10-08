import React, { useState, useEffect, useRef } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, testConnection, loginWithGoogle, logoutUser } from "./firebase";
import {
  subscribeToClub,
  subscribeToEvents,
  saveClubToFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  seedInitialFirestoreData,
  syncUserProfile,
  subscribeToUserProfile,
  subscribeToAllUsers,
  adminUpdateUser,
  adminDeleteUser,
  seedSampleUsersToFirestore,
} from "./services/firestoreService";
import {
  EventItem,
  DEFAULT_SAMPLE_EVENTS,
  uid,
  TYPES,
  CATS,
  UserProfile,
  UserRole,
  UserStatus,
  BOOTSTRAP_ADMIN_EMAIL,
  DEFAULT_SAMPLE_USERS,
} from "./types";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { CalendarView } from "./components/CalendarView";
import { EventDetailView } from "./components/EventDetailView";
import { PrintSheetModal } from "./components/PrintSheetModal";
import { DataBackupModal } from "./components/DataBackupModal";
import { LoginPage } from "./components/LoginPage";
import { PendingApprovalPage } from "./components/PendingApprovalPage";
import { UserManagementModal } from "./components/UserManagementModal";
import { Menu, X, Shield, Plus, Calendar as CalendarIcon, LayoutDashboard, Clock } from "lucide-react";

const STORAGE_KEY = "rugby_planner_v1";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [isFirestoreLive, setIsFirestoreLive] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const hasSeededFirestore = useRef(false);

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

  // 1. Listen to Auth State and sync User Profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          setCurrentUserProfile(profile);
        } catch (err) {
          console.error("Erreur syncUserProfile:", err);
        }
      } else {
        setCurrentUserProfile(null);
      }
    });
    return () => unsub();
  }, []);

  // Listen to profile updates in real time (e.g. when Admin approves user!)
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToUserProfile(currentUser.uid, (profile) => {
      if (profile) {
        setCurrentUserProfile(profile);
      }
    });
    return () => unsub();
  }, [currentUser]);

  // If Admin, listen to all users in real time for approval
  useEffect(() => {
    if (currentUserProfile?.role === "Admin" && currentUserProfile?.status === "approved") {
      const unsub = subscribeToAllUsers((users) => {
        setAllUsers(users);
        // Automatically seed sample users if only the admin exists or collection is small
        if (users.length <= 1 && !hasSeededFirestore.current && auth.currentUser) {
          hasSeededFirestore.current = true;
          seedSampleUsersToFirestore(currentUser?.email || BOOTSTRAP_ADMIN_EMAIL).catch(() => {});
        }
      });
      return () => unsub();
    }
  }, [currentUserProfile?.role, currentUserProfile?.status, currentUser?.email]);

  // 2. Attach real-time subscriptions when user is authenticated
  useEffect(() => {
    testConnection().then((ok) => {
      if (ok) {
        setIsFirestoreLive(true);
      }
    });

    if (!currentUser || currentUserProfile?.status !== "approved") {
      return;
    }

    const unsubClub = subscribeToClub((liveName) => {
      if (liveName) {
        setClubName(liveName);
        setIsFirestoreLive(true);
      }
    });

    const unsubEvents = subscribeToEvents((liveEvents) => {
      setIsFirestoreLive(true);
      if (liveEvents.length > 0) {
        setEvents(liveEvents);
      } else if (!hasSeededFirestore.current && auth.currentUser) {
        hasSeededFirestore.current = true;
        seedInitialFirestoreData(clubName, events).catch(() => {});
      }
    });

    return () => {
      unsubClub();
      unsubEvents();
    };
  }, [currentUser, currentUserProfile?.status]);

  // Persist to local storage as offline cache
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

  const handleLoginGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setIsDemoUser(false);
        showToast(`Connecté en tant que ${user.displayName || user.email}`);
        const profile = await syncUserProfile(user);
        setCurrentUserProfile(profile);
        if (profile.status === "approved") {
          seedInitialFirestoreData(clubName, events).catch(() => {});
        }
      }
    } catch (err: any) {
      showToast("Connexion annulée ou erreur d'authentification");
    }
  };

  const handleLoginAsDemo = (profile: UserProfile) => {
    setIsDemoUser(true);
    const mockUser: any = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL || "",
    };
    setCurrentUser(mockUser);
    setCurrentUserProfile(profile);
    setUserManagementOpen(false);
    showToast(`Connecté en tant que ${profile.displayName} (${profile.role})`);
  };

  const handleSimulateUser = (user: UserProfile) => {
    handleLoginAsDemo(user);
  };

  const handleExitDemo = () => {
    setIsDemoUser(false);
    setCurrentUser(null);
    setCurrentUserProfile(null);
    showToast("Mode démo quitté");
  };

  const handleLogoutGoogle = async () => {
    try {
      if (!isDemoUser) {
        await logoutUser();
      }
      setIsDemoUser(false);
      setCurrentUser(null);
      setCurrentUserProfile(null);
      showToast("Déconnexion réussie");
    } catch (err) {
      showToast("Erreur lors de la déconnexion");
    }
  };

  const handleSeedSampleUsers = async () => {
    const adminEmail = currentUser?.email || BOOTSTRAP_ADMIN_EMAIL;
    await seedSampleUsersToFirestore(adminEmail);
    setAllUsers((prev) => {
      const existing = new Set(prev.map((u) => u.uid));
      const next = [...prev];
      for (const sample of DEFAULT_SAMPLE_USERS) {
        if (!existing.has(sample.uid)) {
          next.push(sample);
        }
      }
      return next;
    });
    showToast("Membres démo (Bénévoles & Joueurs) ajoutés !");
  };

  const handleAdminUpdateUser = async (targetUid: string, role: UserRole, status: UserStatus) => {
    if (!currentUser) return;
    await adminUpdateUser(targetUid, role, status, currentUser.uid);
  };

  const handleAdminDeleteUser = async (targetUid: string) => {
    await adminDeleteUser(targetUid);
  };

  const handleClubNameChange = (name: string) => {
    setClubName(name);
    if (currentUser) {
      saveClubToFirestore(name).catch(() => {});
    }
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

  const isAdmin = currentUserProfile?.role === "Admin";

  const handleNewEvent = () => {
    if (!isAdmin) {
      showToast("L'ajout d'événements est réservé à l'administrateur");
      return;
    }
    const fresh = createNewEvent();
    setEvents((prev) => [fresh, ...prev]);
    setSelectedEventId(fresh.id);
    setMobileMenuOpen(false);
    showToast("Nouvel événement créé");
    if (currentUser) {
      saveEventToFirestore(fresh).catch(() => {});
    }
  };

  const handleNewEventWithType = (type: string, category: string, defaultName: string) => {
    if (!isAdmin) {
      showToast("L'ajout d'événements est réservé à l'administrateur");
      return;
    }
    const fresh = createNewEvent();
    fresh.type = type;
    fresh.cat = category;
    fresh.nom = defaultName;
    setEvents((prev) => [fresh, ...prev]);
    setSelectedEventId(fresh.id);
    setMobileMenuOpen(false);
    showToast("Nouvel événement créé à partir du modèle");
    if (currentUser) {
      saveEventToFirestore(fresh).catch(() => {});
    }
  };

  const handleNewEventForDate = (dateIso: string) => {
    if (!isAdmin) {
      showToast("L'ajout d'événements est réservé à l'administrateur");
      return;
    }
    const fresh = createNewEvent(dateIso);
    setEvents((prev) => [fresh, ...prev]);
    setSelectedEventId(fresh.id);
    showToast(`Événement créé pour le ${dateIso}`);
    if (currentUser) {
      saveEventToFirestore(fresh).catch(() => {});
    }
  };

  const handleUpdateEvent = (updated: EventItem) => {
    if (!isAdmin) {
      showToast("La modification d'événements est réservée à l'administrateur");
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (currentUser) {
      saveEventToFirestore(updated).catch(() => {});
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (!isAdmin) {
      showToast("La suppression d'événements est réservée à l'administrateur");
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (selectedEventId === id) {
      setSelectedEventId(null);
    }
    showToast("Événement supprimé");
    if (currentUser) {
      deleteEventFromFirestore(id).catch(() => {});
    }
  };

  const handleDuplicateEvent = (target: EventItem) => {
    if (!isAdmin) {
      showToast("La duplication d'événements est réservée à l'administrateur");
      return;
    }
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
    if (currentUser) {
      saveEventToFirestore(clone).catch(() => {});
    }
  };

  const handleImportData = (newClubName: string, newEvents: EventItem[]) => {
    setClubName(newClubName);
    setEvents(newEvents);
    setSelectedEventId(null);
    showToast("Données importées avec succès");
    if (currentUser) {
      seedInitialFirestoreData(newClubName, newEvents).catch(() => {});
    }
  };

  const handleResetData = () => {
    setClubName("Rugby Club de l'Ovalie");
    setEvents(DEFAULT_SAMPLE_EVENTS);
    setSelectedEventId(null);
    showToast("Exemples de démonstration restaurés");
    if (currentUser) {
      seedInitialFirestoreData("Rugby Club de l'Ovalie", DEFAULT_SAMPLE_EVENTS).catch(() => {});
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  if (!currentUser) {
    return (
      <LoginPage
        clubName={clubName}
        onLoginGoogle={handleLoginGoogle}
        onLoginAsDemo={handleLoginAsDemo}
      />
    );
  }

  if (!currentUserProfile) {
    return (
      <div className="min-h-screen bg-[#0E1E38] text-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-white/20 border-t-[#DE4B44] rounded-full animate-spin mb-3"></div>
        <div className="text-sm font-semibold">Vérification de votre compte au club...</div>
      </div>
    );
  }

  if (currentUserProfile.status === "pending") {
    return (
      <PendingApprovalPage
        profile={currentUserProfile}
        clubName={clubName}
        onRefresh={() => {
          if (currentUser) {
            syncUserProfile(currentUser).then((p) => {
              setCurrentUserProfile(p);
              showToast("Statut actualisé");
            });
          }
        }}
        onLogout={handleLogoutGoogle}
      />
    );
  }

  if (currentUserProfile.status === "rejected") {
    return (
      <div className="min-h-screen bg-[#0E1E38] text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center mx-auto mb-3">
          <X className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">Accès refusé</h1>
        <p className="text-xs text-slate-300 max-w-sm mb-4">
          Votre compte n'a pas été validé par l'administrateur du club.
        </p>
        <button
          onClick={handleLogoutGoogle}
          className="px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-semibold cursor-pointer"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#161B22] flex flex-col font-sans selection:bg-[#DE4B44] selection:text-white">
      {/* Demo Mode Interactive Banner */}
      {isDemoUser && (
        <div className="no-print bg-[#122A54] border-b border-amber-400/40 text-white px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shadow-xs">
              Mode Test / Démo
            </span>
            <span className="text-slate-200">
              Vue connectée en tant que :{" "}
              <strong className="text-white underline decoration-amber-400 font-bold">
                {currentUserProfile?.displayName}
              </strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentUserProfile?.role === "Benevole"
                  ? "bg-amber-400 text-slate-900"
                  : currentUserProfile?.role === "Joueur"
                  ? "bg-sky-400 text-slate-900"
                  : "bg-rose-500 text-white"
              }`}
            >
              Rôle : {currentUserProfile?.role}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const targetRole = currentUserProfile?.role === "Benevole" ? "Joueur" : "Benevole";
                const next = DEFAULT_SAMPLE_USERS.find((u) => u.role === targetRole) || DEFAULT_SAMPLE_USERS[0];
                handleLoginAsDemo(next);
              }}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer transition-colors border border-white/20"
            >
              Basculer vers {currentUserProfile?.role === "Benevole" ? "Joueur" : "Bénévole"}
            </button>
            <button
              onClick={handleExitDemo}
              className="px-2.5 py-1 rounded bg-[#C1272D] hover:bg-[#DE4B44] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Quitter le mode test
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
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
          {isAdmin && (
            <button
              onClick={handleNewEvent}
              className="p-1.5 bg-[#C1272D] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
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
          onClubNameChange={handleClubNameChange}
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
          currentUser={currentUser}
          currentUserProfile={currentUserProfile}
          pendingUsersCount={allUsers.filter((u) => u.status === "pending").length}
          onOpenUserManagement={() => setUserManagementOpen(true)}
          onLoginGoogle={handleLoginGoogle}
          onLogoutGoogle={handleLogoutGoogle}
          isFirestoreLive={isFirestoreLive}
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
            isAdmin={isAdmin}
          />
        ) : currentView === "calendar" ? (
          <CalendarView
            events={events}
            onSelectEvent={(id) => setSelectedEventId(id)}
            onNewEventForDate={handleNewEventForDate}
            isAdmin={isAdmin}
          />
        ) : (
          <DashboardView
            clubName={clubName}
            events={events}
            onSelectEvent={(id) => setSelectedEventId(id)}
            onNewEventWithType={handleNewEventWithType}
            onNewEvent={handleNewEvent}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {/* User Management Modal (Admin only) */}
      {userManagementOpen && currentUser && (
        <UserManagementModal
          isOpen={userManagementOpen}
          onClose={() => setUserManagementOpen(false)}
          users={allUsers.length > 0 ? allUsers : DEFAULT_SAMPLE_USERS}
          currentAdminUid={currentUser.uid}
          onUpdateUser={handleAdminUpdateUser}
          onDeleteUser={handleAdminDeleteUser}
          onShowToast={showToast}
          onSeedSampleUsers={handleSeedSampleUsers}
          onSimulateUser={handleSimulateUser}
        />
      )}

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
    </div>
  );
}
