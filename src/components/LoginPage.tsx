import React, { useState } from "react";
import { Shield, Users, CheckSquare, Calendar, ArrowRight, Sparkles } from "lucide-react";

interface LoginPageProps {
  clubName: string;
  onLoginGoogle: () => Promise<void>;
  onContinueAsGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  clubName,
  onLoginGoogle,
  onContinueAsGuest,
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
      setErrorMsg("Connexion annulée ou fermée. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

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
              Espace Dirigeants &amp; Éducateurs
            </div>
            <div className="font-heading text-lg font-bold text-white tracking-wide">
              {clubName}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <Shield className="w-3.5 h-3.5 text-[#DE4B44]" />
          <span>Portail FFR &bull; Saison en cours</span>
        </div>
      </header>

      {/* Center Sign-in Box */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-auto">
        <div className="w-full max-w-md bg-[#162B50]/90 backdrop-blur-md rounded-2xl border border-white/15 p-7 sm:p-9 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <Sparkles className="w-3 h-3 text-rose-400" />
              Feuille de match &amp; Organisation du club
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-wide">
              Bienvenue au Club
            </h1>
            <p className="text-xs text-slate-300/90 leading-relaxed max-w-xs mx-auto">
              Connectez-vous pour accéder au calendrier partagé, à la préparation des matchs et à la gestion des bénévoles.
            </p>
          </div>

          {/* Features Preview Mini Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-200">
            <div className="bg-black/25 border border-white/10 p-2.5 rounded-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">Calendrier partagé</span>
            </div>
            <div className="bg-black/25 border border-white/10 p-2.5 rounded-lg flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Feuilles de route</span>
            </div>
            <div className="bg-black/25 border border-white/10 p-2.5 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">Pôles bénévoles</span>
            </div>
            <div className="bg-black/25 border border-white/10 p-2.5 rounded-lg flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">Déclaration FFR</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
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
                  : "Continuer avec Google (Synchronisé)"}
              </span>
            </button>

            {/* Guest / Consultation Mode */}
            <button
              onClick={onContinueAsGuest}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span>Accéder en mode invité (hors-ligne)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 text-center text-[11px] text-slate-400">
            🔒 Données sécurisées &bull; Base Cloud Firestore synchronisée
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
