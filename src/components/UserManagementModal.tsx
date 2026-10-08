import React, { useState } from "react";
import { UserProfile, UserRole, UserStatus, BOOTSTRAP_ADMIN_EMAIL } from "../types";
import {
  Users,
  Check,
  X,
  Trash2,
  Shield,
  Clock,
  CheckCircle2,
  Filter,
  Trophy,
  HeartHandshake,
  Eye,
  UserPlus,
  Pencil,
  Ban,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  currentAdminUid: string;
  onUpdateUser: (
    targetUid: string,
    updates: {
      role?: UserRole;
      status?: UserStatus;
      displayName?: string;
    }
  ) => Promise<void>;
  onDeleteUser: (targetUid: string) => Promise<void>;
  onAddUser: (data: { displayName: string; email: string; role: UserRole; status: UserStatus }) => Promise<void>;
  onShowToast: (msg: string) => void;
  onSimulateUser?: (user: UserProfile) => void;
}

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: React.FC<any>; bg: string; text: string; border: string; desc: string; badge: string }
> = {
  Admin: {
    label: "Admin",
    icon: Shield,
    bg: "bg-red-50 text-red-700 border-red-200",
    text: "text-red-700",
    border: "border-red-200",
    desc: "Gestion complète du club, des matchs et validation des membres",
    badge: "bg-red-100 text-red-800 border-red-200",
  },
  Benevole: {
    label: "Bénévole",
    icon: HeartHandshake,
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    text: "text-amber-800",
    border: "border-amber-200",
    desc: "Organisation logistique, matériel, buvette et feuilles de match",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  Joueur: {
    label: "Joueur",
    icon: Trophy,
    bg: "bg-sky-50 text-sky-800 border-sky-200",
    text: "text-sky-800",
    border: "border-sky-200",
    desc: "Consultation du calendrier, convocations et coups d'envoi",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
};

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  currentAdminUid,
  onUpdateUser,
  onDeleteUser,
  onAddUser,
  onShowToast,
  onSimulateUser,
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "deactivated">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("Benevole");
  const [newStatus, setNewStatus] = useState<UserStatus>("approved");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("Benevole");
  const [editStatus, setEditStatus] = useState<UserStatus>("approved");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    if (filterStatus === "all") return true;
    return u.status === filterStatus;
  });

  const pendingCount = users.filter((u) => u.status === "pending").length;
  const approvedCount = users.filter((u) => u.status === "approved").length;
  const deactivatedCount = users.filter((u) => u.status === "deactivated").length;

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setEditDisplayName(u.displayName || "");
    setEditRole(u.role);
    setEditStatus(u.status);
    setEditError(null);
    setShowDeleteConfirm(false);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditError(null);
    setShowDeleteConfirm(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editDisplayName.trim()) {
      setEditError("Veuillez renseigner un nom.");
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      await onUpdateUser(editingUser.uid, {
        displayName: editDisplayName.trim(),
        role: editRole,
        status: editStatus,
      });
      onShowToast(`Profil de ${editDisplayName.trim()} mis à jour avec succès !`);
      closeEditModal();
    } catch (err: any) {
      console.error(err);
      setEditError("Erreur lors de la mise à jour du membre.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivateToggle = async (targetUser: UserProfile) => {
    const nextStatus: UserStatus = targetUser.status === "deactivated" ? "approved" : "deactivated";
    setActionLoading(targetUser.uid);
    try {
      await onUpdateUser(targetUser.uid, { status: nextStatus });
      onShowToast(
        nextStatus === "deactivated"
          ? `Compte de ${targetUser.displayName} désactivé.`
          : `Compte de ${targetUser.displayName} réactivé !`
      );
      if (editingUser?.uid === targetUser.uid) {
        setEditStatus(nextStatus);
      }
    } catch (e) {
      onShowToast("Erreur lors de la mise à jour du statut.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePermanent = async (targetUser: UserProfile) => {
    if (targetUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      onShowToast("Impossible de supprimer l'administrateur principal.");
      return;
    }
    setActionLoading(targetUser.uid);
    try {
      await onDeleteUser(targetUser.uid);
      onShowToast(`Membre ${targetUser.displayName} supprimé.`);
      closeEditModal();
    } catch (e) {
      onShowToast("Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) {
      setAddError("Veuillez renseigner un nom complet ou un pseudo.");
      return;
    }
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setAddError("Veuillez renseigner une adresse email valide.");
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      await onAddUser({
        displayName: newDisplayName.trim(),
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        status: newStatus,
      });
      onShowToast(`Membre ${newDisplayName.trim()} ajouté avec succès !`);
      setShowAddModal(false);
      setNewDisplayName("");
      setNewEmail("");
      setNewRole("Benevole");
      setNewStatus("approved");
    } catch (err: any) {
      console.error(err);
      setAddError("Erreur lors de l'enregistrement du membre.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#122A54] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C1272D] flex items-center justify-center text-white font-heading text-lg font-bold shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg sm:text-xl leading-tight">
                Gestion des Membres &amp; Approbations
              </h3>
              <p className="text-xs text-slate-300">
                Gérez les adhérents, modifiez les rôles et activez ou désactivez les accès au club
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Filters Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrer :
            </span>
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                filterStatus === "all"
                  ? "bg-[#122A54] text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Tous ({users.length})
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                filterStatus === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Validés ({approvedCount})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                filterStatus === "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
              }`}
            >
              En attente ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("deactivated")}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                filterStatus === "deactivated"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Désactivés ({deactivatedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAddError(null);
                setShowAddModal(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#C1272D] hover:bg-[#DE4B44] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Ajouter un membre</span>
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-2 pb-24">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div>Aucun membre dans cette catégorie.</div>
              <button
                type="button"
                onClick={() => {
                  setAddError(null);
                  setShowAddModal(true);
                }}
                className="mt-3 text-[#C1272D] hover:underline font-semibold cursor-pointer"
              >
                + Ajouter un nouveau membre
              </button>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isBootstrap =
                u.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
              const isPending = u.status === "pending";
              const isDeactivated = u.status === "deactivated";
              const roleInfo = ROLE_CONFIG[u.role] || ROLE_CONFIG.Benevole;
              const RoleIcon = roleInfo.icon;

              return (
                <div
                  key={u.uid}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 sm:px-3.5 rounded-xl transition-all ${
                    isPending
                      ? "bg-amber-50/70 border border-amber-200 shadow-xs"
                      : isDeactivated
                      ? "bg-slate-100/60 opacity-75 border border-slate-200"
                      : "hover:bg-slate-50 border border-transparent hover:border-slate-100"
                  }`}
                >
                  {/* Column 1: Membre info */}
                  <div className="flex-1 min-w-[200px] flex items-center gap-3">
                    {u.photoURL ? (
                      <img
                        src={u.photoURL}
                        alt={u.displayName}
                        className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                          isDeactivated
                            ? "bg-slate-400"
                            : u.role === "Admin"
                            ? "bg-[#C1272D]"
                            : u.role === "Benevole"
                            ? "bg-amber-500 text-slate-900"
                            : "bg-[#122A54]"
                        }`}
                      >
                        {u.displayName ? u.displayName.slice(0, 2).toUpperCase() : "MB"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="font-heading font-bold text-slate-900 text-sm leading-tight truncate">
                        {u.displayName || "Sans nom"}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Inscrit le{" "}
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("fr-FR")
                          : "Date inconnue"}
                      </div>
                    </div>
                  </div>

                  {/* Badges and Actions Container (md:contents keeps strict alignment across rows) */}
                  <div className="flex items-center justify-between md:contents gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap md:contents">
                      {/* Column 2: Aligned Type Tag (Super Admin / Compte Démo / Adhérent) */}
                      <div className="md:w-28 shrink-0 flex items-center md:justify-center">
                        {isBootstrap ? (
                          <span className="text-[11px] bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full border border-red-200 shadow-2xs">
                            Super Admin
                          </span>
                        ) : u.uid.startsWith("fake-") ? (
                          <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                            Compte Démo
                          </span>
                        ) : (
                          <span className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                            Adhérent
                          </span>
                        )}
                      </div>

                      {/* Column 3: Aligned Role Tag */}
                      <div className="md:w-28 shrink-0 flex items-center md:justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${roleInfo.bg} shadow-2xs`}
                        >
                          <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{roleInfo.label}</span>
                        </span>
                      </div>

                      {/* Column 4: Aligned Status Tag */}
                      <div className="md:w-28 shrink-0 flex items-center md:justify-center">
                        {isDeactivated ? (
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                            <Ban className="w-3 h-3 text-slate-500" />
                            Désactivé
                          </span>
                        ) : isPending ? (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            En attente
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Validé
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Column 5: Aligned Actions (Only icons) */}
                    <div className="md:w-20 shrink-0 flex items-center justify-end gap-1.5">
                      {/* Test View Simulation (Icon only) */}
                      {onSimulateUser && (
                        <button
                          type="button"
                          onClick={() => onSimulateUser(u)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all shadow-2xs active:scale-95 cursor-pointer"
                          title={`Tester l'application avec la vue de ${u.displayName}`}
                          aria-label={`Tester l'application avec la vue de ${u.displayName}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Button (Icon only) */}
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="p-2 rounded-lg bg-white hover:bg-slate-100 text-[#122A54] hover:text-[#C1272D] border border-slate-200 hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                        title="Modifier (nom, rôle, statut ou désactiver)"
                        aria-label="Modifier le membre"
                      >
                        <Pencil className="w-4 h-4 text-[#C1272D]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>🏉 <strong>Rôles du club :</strong> Admin (direction), Bénévole (logistique), Joueur (calendrier).</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#122A54] hover:bg-[#1a386e] text-white font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Edit User Modal Dialog */}
      {editingUser && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-4 bg-[#122A54] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C1272D] flex items-center justify-center text-white">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base leading-tight">
                    Modifier le membre
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Mise à jour du nom, du rôle et des droits d'accès
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              {editError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {editError}
                </div>
              )}

              {/* Display Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Nom &amp; Prénom / Identifiant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="ex: Benevol1, Jean Dupont..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DE4B44] text-xs font-medium"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Adresse email
                </label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-xs cursor-not-allowed"
                />
              </div>

              {/* Role selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Rôle au sein du club
                </label>
                {editingUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ? (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Compte Super Admin principal (rôle non modifiable).</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {(["Benevole", "Joueur", "Admin"] as UserRole[]).map((r) => {
                      const conf = ROLE_CONFIG[r];
                      const Icon = conf.icon;
                      const isSelected = editRole === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setEditRole(r)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col items-start gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? `${conf.bg} ring-2 ring-[#DE4B44] font-bold shadow-xs`
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 font-medium"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <Icon className={`w-3.5 h-3.5 ${conf.text}`} />
                            {isSelected && <Check className="w-3 h-3 text-[#DE4B44]" />}
                          </div>
                          <span className="text-xs text-slate-900">{conf.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status / Activation */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">
                  Statut du compte &amp; Accès
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Approved */}
                  <button
                    type="button"
                    onClick={() => setEditStatus("approved")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      editStatus === "approved"
                        ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-600 font-bold text-emerald-900"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {editStatus === "approved" && <Check className="w-3 h-3 text-emerald-600" />}
                    </div>
                    <span className="text-xs">Actif (Validé)</span>
                  </button>

                  {/* Pending */}
                  <button
                    type="button"
                    onClick={() => setEditStatus("pending")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      editStatus === "pending"
                        ? "bg-amber-50 border-amber-300 ring-2 ring-amber-500 font-bold text-amber-900"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {editStatus === "pending" && <Check className="w-3 h-3 text-amber-600" />}
                    </div>
                    <span className="text-xs">En attente</span>
                  </button>

                  {/* Deactivated */}
                  <button
                    type="button"
                    onClick={() => setEditStatus("deactivated")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      editStatus === "deactivated"
                        ? "bg-slate-200 border-slate-400 ring-2 ring-slate-600 font-bold text-slate-900"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Ban className="w-3.5 h-3.5 text-slate-600" />
                      {editStatus === "deactivated" && <Check className="w-3 h-3 text-slate-700" />}
                    </div>
                    <span className="text-xs">Désactivé</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  {editStatus === "deactivated"
                    ? "🔒 Le compte est désactivé : l'utilisateur ne peut plus se connecter ni voir les données du club."
                    : editStatus === "pending"
                    ? "⏳ Le compte est en attente d'approbation par un administrateur."
                    : "✅ Le compte est actif et autorisé à accéder au club selon son rôle."}
                </p>
              </div>

              {/* Danger Zone: Permanent delete */}
              {editingUser.email.toLowerCase() !== BOOTSTRAP_ADMIN_EMAIL.toLowerCase() && (
                <div className="pt-2 border-t border-slate-100">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer définitivement ce compte de Firestore</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Confirmer la suppression définitive ?</span>
                      </div>
                      <p className="text-[11px] text-red-700 leading-tight">
                        Cette action efface définitivement le profil. Si vous souhaitez seulement couper l'accès, préférez le statut <strong>Désactivé</strong> ci-dessus.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleDeletePermanent(editingUser)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Oui, supprimer définitivement
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-[#122A54] hover:bg-[#1a386e] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {editLoading ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-4 bg-[#122A54] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C1272D] flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base leading-tight">
                    Ajouter un nouveau membre
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Création directe dans l'annuaire du club
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUserSubmit} className="p-5 space-y-4 text-xs">
              {addError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {addError}
                </div>
              )}

              {/* Display Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Nom &amp; Prénom / Identifiant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="ex: Benevol1, Jean Dupont, Joueur1..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DE4B44] text-xs font-medium"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ex: benevol1@rugby-club.fr"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DE4B44] text-xs font-medium"
                />
              </div>

              {/* Role selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Rôle au sein du club
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Benevole", "Joueur", "Admin"] as UserRole[]).map((r) => {
                    const conf = ROLE_CONFIG[r];
                    const Icon = conf.icon;
                    const isSelected = newRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewRole(r)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col items-start gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? `${conf.bg} ${conf.border} ring-2 ring-[#DE4B44] font-bold`
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`w-3.5 h-3.5 ${conf.text}`} />
                          {isSelected && <Check className="w-3 h-3 text-[#DE4B44]" />}
                        </div>
                        <span className="text-xs text-slate-900">{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-slate-700 block">
                  Statut d'accès initial
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === "approved"}
                      onChange={() => setNewStatus("approved")}
                      className="text-[#DE4B44] focus:ring-[#DE4B44]"
                    />
                    <span className="text-emerald-700 font-semibold">Validé immédiatement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === "pending"}
                      onChange={() => setNewStatus("pending")}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-amber-700 font-semibold">En attente</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 rounded-lg bg-[#C1272D] hover:bg-[#DE4B44] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {addLoading ? (
                    <span>Création...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Créer le membre</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
