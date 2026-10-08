import React, { useState } from "react";
import { Shield, Users, CheckSquare, Calendar, Sparkles, Lock, Trophy, HeartHandshake, ArrowRight } from "lucide-react";
import { UserProfile, DEFAULT_SAMPLE_USERS } from "../types";

interface LoginPageProps {
  clubName: string;
  onLoginGoogle: () => Promise<void>;
  onLoginAsDemo?: (profile: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  clubName,
  onLoginGoogle,
  onLoginAsDemo,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleClick = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await onLoginGoogle();
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || String(err);
      if (err?.code === "auth/unauthorized-domain" || msg.includes("unauthorized-domain")) {
        setErrorMsg(
          "Domaine non autorisé dans Firebase : le domaine 'laurentp22.github.io' doit être ajouté dans la console Firebase (Authentication > Paramètres > Domaines autorisés). Vous pouvez aussi utiliser les boutons démo ci-dessous pour tester immédiatement."
        );
      } else {
        setErrorMsg("Connexion annulée ou fermée. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Find sample Benevole and Joueur
  const sampleBenevole = DEFAULT_SAMPLE_USERS.find((u) => u.role === "Benevole" && u.status === "approved") || DEFAULT_SAMPLE_USERS[0];
  const sampleJoueur = DEFAULT_SAMPLE_USERS.find((u) => u.role === "Joueur" && u.status === "approved") || DEFAULT_SAMPLE_USERS[1];

  return (
    <div className="min-h-screen bg-[#0E1E38] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#DE4B44] selection:text-white">
      {/* Background Rugby Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(193,39,45,0.25)_0%,_rgba(18,42,84,0.3)_40%,_transparent_75%)] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Branding */}
      <header className="p-6 sm:p-8 flex items-center justify-between relative z-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C1272D] flex items-center justify-center font-heading text-2xl font-bold text-white shadow-lg border border-white/20">
            15
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
              Espace Membres &bull; Accès Sécurisé
            </div>
            <div className="font-heading text-lg font-bold text-white tracking-wide">
              {clubName}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <Shield className="w-3.5 h-3.5 text-[#DE4B44]" />
          <span>Portail FFR &bull; Validation Administrateur</span>
        </div>
      </header>

      {/* Center Sign-in Box */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-auto">
        <div className="w-full max-w-md bg-[#162B50]/90 backdrop-blur-md rounded-2xl border border-white/15 p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              Connexion Obligatoire
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Accès au Club
            </h1>
            <p className="text-xs text-slate-300/90 leading-relaxed max-w-xs mx-auto">
              Authentification requise pour tous les membres (Admins, Bénévoles, Joueurs). Tout nouveau compte est soumis à validation.
            </p>
          </div>

          {/* Roles list */}
          <div className="bg-black/25 border border-white/10 p-3 rounded-xl space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">
              Rôles autorisés au club :
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span><strong>Admin</strong> : Gestion complète du club, matchs &amp; validation des membres</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span><strong>Bénévole</strong> : Suivi logistique, buvette, matériel &amp; feuilles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
              <span><strong>Joueur</strong> : Calendrier des rencontres, convocations &amp; horaires</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-center font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* Action Button: Google Sign In */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {loading
                  ? "Connexion en cours..."
                  : "Se connecter avec Google"}
              </span>
            </button>
          </div>

          {/* Quick Demo Accounts: Fake Benevole & Joueur */}
          {onLoginAsDemo && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold uppercase tracking-wider">
                <span>Comptes de test (Sans compte Google) :</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Fake Benevole */}
                <button
                  type="button"
                  onClick={() => onLoginAsDemo(sampleBenevole)}
                  className="p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 text-xs font-semibold flex flex-col items-start gap-1 transition-all cursor-pointer group active:scale-98 text-left"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
                      <HeartHandshake className="w-4 h-4 text-amber-400" />
                      Bénévole
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-300" />
                  </div>
                  <div className="text-[11px] text-amber-200/70 font-normal">
                    Accès Bénévole
                  </div>
                </button>

                {/* Fake Joueur */}
                <button
                  type="button"
                  onClick={() => onLoginAsDemo(sampleJoueur)}
                  className="p-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-200 text-xs font-semibold flex flex-col items-start gap-1 transition-all cursor-pointer group active:scale-98 text-left"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5 text-sky-300 font-bold text-sm">
                      <Trophy className="w-4 h-4 text-sky-400" />
                      Joueur
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sky-300" />
                  </div>
                  <div className="text-[11px] text-sky-200/70 font-normal">
                    Accès Joueur
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 text-center text-[11px] text-slate-400">
            🔒 Sécurisé &bull; Validation par l'administrateur
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400 border-t border-white/10 relative z-10">
        🏉 Rugby Club Planner &bull; Feuille de match XV &bull; FFR ready
      </footer>
    </div>
  );
};
