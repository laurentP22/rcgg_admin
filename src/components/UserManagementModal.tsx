import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  Trophy,
  HeartHandshake,
  UserCheck,
} from "lucide-react";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  currentAdminUid: string;
  onUpdateUser: (targetUid: string, role: UserRole, status: UserStatus) => Promise<void>;
  onDeleteUser: (targetUid: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: React.FC<any>; bg: string; text: string; border: string; desc: string }
> = {
  Admin: {
    label: "Admin",
    icon: Shield,
    bg: "bg-red-50 hover:bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    desc: "Gestion complète du club, des matchs et validation des membres",
  },
  Benevole: {
    label: "Bénévole",
    icon: HeartHandshake,
    bg: "bg-amber-50 hover:bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
    desc: "Organisation logistique, matériel, buvette et feuilles de match",
  },
  Joueur: {
    label: "Joueur",
    icon: Trophy,
    bg: "bg-sky-50 hover:bg-sky-100",
    text: "text-sky-800",
    border: "border-sky-200",
    desc: "Consultation du calendrier, coups d'envoi et convocations",
  },
};

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  currentAdminUid,
  onUpdateUser,
  onDeleteUser,
  onShowToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeDropdownUid, setActiveDropdownUid] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdownUid(null);
    };
    if (activeDropdownUid) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDropdownUid]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    if (filterStatus === "all") return true;
    return u.status === filterStatus;
  });

  const pendingCount = users.filter((u) => u.status === "pending").length;

  const handleApprove = async (u: UserProfile, role: UserRole = u.role) => {
    setActionLoading(u.uid);
    try {
      await onUpdateUser(u.uid, role, "approved");
      onShowToast(`Compte de ${u.displayName} validé avec le rôle ${role} !`);
    } catch (e) {
      onShowToast("Erreur lors de la validation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (u: UserProfile, newRole: UserRole) => {
    setActiveDropdownUid(null);
    setActionLoading(u.uid);
    try {
      await onUpdateUser(u.uid, newRole, u.status);
      onShowToast(`Rôle de ${u.displayName} mis à jour : ${newRole}`);
    } catch (e) {
      onShowToast("Erreur lors de la mise à jour");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (u: UserProfile) => {
    if (u.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      onShowToast("Impossible de supprimer l'administrateur principal.");
      return;
    }
    if (window.confirm(`Supprimer l'accès de ${u.displayName} (${u.email}) ?`)) {
      setActionLoading(u.uid);
      try {
        await onDeleteUser(u.uid);
        onShowToast(`Utilisateur ${u.displayName} supprimé.`);
      } catch (e) {
        onShowToast("Erreur lors de la suppression");
      } finally {
        setActionLoading(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#122A54] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C1272D] flex items-center justify-center text-white font-heading text-lg font-bold shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg leading-tight">
                Gestion des Membres &amp; Approbations
              </h3>
              <p className="text-xs text-slate-300">
                Attribuez les rôles (Admin, Bénévole, Joueur) et validez les accès au club
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
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
              onClick={() => setFilterStatus("approved")}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                filterStatus === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Validés ({users.length - pendingCount})
            </button>
          </div>

          {pendingCount > 0 && (
            <div className="text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{pendingCount} demande(s) en attente</span>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Aucun membre dans cette catégorie.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isBootstrap =
                u.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
              const isPending = u.status === "pending";
              const isLoading = actionLoading === u.uid;
              const roleInfo = ROLE_CONFIG[u.role] || ROLE_CONFIG.Benevole;
              const RoleIcon = roleInfo.icon;
              const isDropdownOpen = activeDropdownUid === u.uid;

              return (
                <div
                  key={u.uid}
                  className={`pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl transition-all ${
                    isPending
                      ? "bg-amber-50/80 border border-amber-200 shadow-xs"
                      : "hover:bg-slate-50 border border-transparent hover:border-slate-100"
                  }`}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {u.photoURL ? (
                      <img
                        src={u.photoURL}
                        alt={u.displayName}
                        className="w-11 h-11 rounded-full border border-slate-200 object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#122A54] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {u.email ? u.email[0].toUpperCase() : "U"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-slate-900 text-sm truncate">
                          {u.displayName || "Sans nom"}
                        </span>
                        {isBootstrap && (
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full border border-red-200">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>
                          Inscrit le{" "}
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("fr-FR")
                            : "Date inconnue"}
                        </span>
                        <span>&bull;</span>
                        <span
                          className={`font-semibold ${
                            isPending ? "text-amber-600" : "text-emerald-600"
                          }`}
                        >
                          {isPending ? "En attente d'approbation" : "Accès autorisé"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Role Select */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center relative">
                    {/* CUSTOM ROLE DROPDOWN */}
                    <div className="relative">
                      <button
                        type="button"
                        disabled={isBootstrap || isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownUid(isDropdownOpen ? null : u.uid);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                          roleInfo.bg
                        } ${roleInfo.text} ${roleInfo.border} ${
                          isBootstrap ? "opacity-90 cursor-default" : "hover:shadow"
                        }`}
                        title={
                          isBootstrap
                            ? "Rôle Super Admin non modifiable"
                            : "Cliquer pour modifier le rôle"
                        }
                      >
                        <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{roleInfo.label}</span>
                        {!isBootstrap && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              isDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {/* Custom Dropdown Menu */}
                      {isDropdownOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-fadeIn"
                        >
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                            Choisir le rôle
                          </div>
                          {(["Admin", "Benevole", "Joueur"] as UserRole[]).map((r) => {
                            const conf = ROLE_CONFIG[r];
                            const Icon = conf.icon;
                            const isSelected = u.role === r;

                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => handleRoleChange(u, r)}
                                className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-slate-100 text-slate-900"
                                    : "hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <div
                                  className={`p-1.5 rounded-md shrink-0 ${conf.bg} ${conf.text}`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs">
                                      {conf.label}
                                    </span>
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-[10.5px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                                    {conf.desc}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Approve Button if pending */}
                    {isPending ? (
                      <button
                        onClick={() => handleApprove(u)}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        title="Valider l'accès de ce membre au club"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Valider l'accès</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validé
                      </span>
                    )}

                    {/* Delete button (except super admin) */}
                    {!isBootstrap && (
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={isLoading}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer ce compte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            🏉 Seuls les membres avec le rôle <strong>Admin</strong> peuvent modifier les rôles et valider les accès.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
