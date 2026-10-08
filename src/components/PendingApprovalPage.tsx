import React from "react";
import { UserProfile } from "../types";
import { Clock, ShieldAlert, RefreshCw, LogOut, Shield } from "lucide-react";

interface PendingApprovalPageProps {
  profile: UserProfile;
  clubName: string;
  onRefresh: () => void;
  onLogout: () => void;
}

export const PendingApprovalPage: React.FC<PendingApprovalPageProps> = ({
  profile,
  clubName,
  onRefresh,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-[#0E1E38] text-white flex flex-col justify-between items-center p-4 font-sans relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_top,_rgba(201,138,31,0.2)_0%,_transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-md pt-8 text-center flex items-center justify-center gap-3">
        <div className="w-9 h-9 rounded bg-[#C1272D] flex items-center justify-center font-heading text-xl font-bold text-white shadow-md">
          15
        </div>
        <div className="text-left">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Espace Sécurisé
          </div>
          <div className="font-heading font-bold text-base text-white">{clubName}</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#162B50]/90 backdrop-blur-md rounded-2xl border border-white/15 p-7 sm:p-9 shadow-2xl text-center space-y-6 my-auto">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-wide">
            En attente de validation
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Votre compte a bien été créé, mais il doit être validé par un administrateur du club avant de pouvoir accéder aux feuilles de match et aux plannings.
          </p>
        </div>

        {/* User Card */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-left flex items-center gap-3.5">
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName}
              className="w-11 h-11 rounded-full border border-white/20 shrink-0 object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {profile.email ? profile.email[0].toUpperCase() : "U"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate">
              {profile.displayName}
            </div>
            <div className="text-xs text-slate-400 truncate">{profile.email}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Statut : En attente
              </span>
              <span className="text-[10px] text-slate-400">
                Rôle : {profile.role}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 text-left space-y-1">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Que devez-vous faire ?
          </div>
          <p className="text-[11px] text-slate-400">
            Prévenez le président, l'entraîneur ou le secrétaire de votre club pour qu'il approuve votre accès dans l'onglet des membres.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onRefresh}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Vérifier si mon compte est validé
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md pb-6 text-center text-xs text-slate-500">
        🏉 {clubName} &bull; Espace Sécurisé
      </footer>
    </div>
  );
};
