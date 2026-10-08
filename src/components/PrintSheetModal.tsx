import React from "react";
import { EventItem, getTypeInfo, formatDateFrench } from "../types";
import { Printer, X, Shield } from "lucide-react";

interface PrintSheetModalProps {
  event: EventItem | null;
  clubName: string;
  onClose: () => void;
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  event,
  clubName,
  onClose,
}) => {
  if (!event) return null;

  const typeInfo = getTypeInfo(event.type);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-rose-400" />
            <span className="font-heading font-bold text-base">
              Aperçu avant impression &bull; Feuille de route du match
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#C1272D] hover:bg-[#DE4B44] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              Lancer l'impression / PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 text-slate-900 bg-white print-page">
          {/* Official Document Header */}
          <div className="border-b-4 border-[#122A54] pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#C1272D] flex items-center gap-1.5 mb-1">
                <Shield className="w-4 h-4 text-[#C1272D]" />
                Fédération Française de Rugby &bull; Club Affilié
              </div>
              <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-[#122A54]">
                {clubName}
              </h1>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">
                Feuille de Route &amp; Organisation &bull; {typeInfo.label}
              </div>
            </div>

            <div className="text-right">
              <div className="border-2 border-slate-800 px-3 py-1.5 rounded text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-500">
                  Document Officiel
                </span>
                <span className="font-heading text-xl font-bold text-[#122A54]">
                  MATCH N° XV
                </span>
              </div>
            </div>
          </div>

          {/* Event Key Info Box */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-300 rounded p-4 mb-6 text-xs">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Rencontre / Événement
              </span>
              <span className="font-bold text-base text-slate-900">
                {event.nom}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Catégorie FFR
              </span>
              <span className="font-bold text-sm text-slate-800">
                {event.cat}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Date &amp; Horaire
              </span>
              <span className="font-bold text-sm text-slate-800">
                {formatDateFrench(event.date)}{" "}
                {event.horaire ? `(${event.horaire})` : ""}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Lieu / Terrain
              </span>
              <span className="font-bold text-sm text-slate-800">
                {event.lieu || "Non précisé"}
              </span>
            </div>

            {event.adversaire && (
              <div className="col-span-2">
                <span className="block text-[10px] uppercase font-bold text-slate-500">
                  Adversaire / Clubs Visiteurs
                </span>
                <span className="font-bold text-sm text-slate-800">
                  {event.adversaire}
                </span>
              </div>
            )}

            {event.notes && (
              <div className="col-span-2 border-t border-slate-200 pt-2">
                <span className="block text-[10px] uppercase font-bold text-slate-500">
                  Consignes &amp; Remarques particulières
                </span>
                <span className="italic text-slate-700">{event.notes}</span>
              </div>
            )}
          </div>

          {/* Grid of Sections: Equipment & Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 1. Matériel */}
            <div className="border border-slate-300 rounded p-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#122A54] border-b-2 border-slate-300 pb-1 mb-3">
                1. Pointage Matériel ({event.materiel.length})
              </h3>
              {event.materiel.length === 0 ? (
                <div className="text-xs italic text-slate-400">
                  Aucun matériel spécifié
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {event.materiel.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center shrink-0">
                        {m.done ? "✓" : ""}
                      </div>
                      <span className={m.done ? "line-through text-slate-400" : "font-medium"}>
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Logistique & Administratif */}
            <div className="border border-slate-300 rounded p-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#122A54] border-b-2 border-slate-300 pb-1 mb-3">
                2. Logistique &amp; Tâches ({event.todo.length})
              </h3>
              {event.todo.length === 0 ? (
                <div className="text-xs italic text-slate-400">
                  Aucune tâche spécifiée
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {event.todo.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-slate-400 rounded-xs flex items-center justify-center shrink-0">
                        {t.done ? "✓" : ""}
                      </div>
                      <span className={t.done ? "line-through text-slate-400" : "font-medium"}>
                        {t.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Bénévoles Assigned */}
          <div className="border border-slate-300 rounded p-4 mb-6">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#122A54] border-b-2 border-slate-300 pb-1 mb-3">
              3. Affectation des Postes Bénévoles ({event.benevoles.length})
            </h3>
            {event.benevoles.length === 0 ? (
              <div className="text-xs italic text-slate-400">
                Aucun poste bénévole créé
              </div>
            ) : (
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-left">
                    <th className="py-1.5 font-bold text-slate-700">Poste</th>
                    <th className="py-1.5 font-bold text-slate-700">Créneau</th>
                    <th className="py-1.5 font-bold text-slate-700">Besoin</th>
                    <th className="py-1.5 font-bold text-slate-700 w-1/3">
                      Nom du responsable / bénévole
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {event.benevoles.map((b) => {
                    const registeredNames = (b.inscrits || []).map((ins) => ins.userName).join(", ");
                    const needed = parseInt(b.nombre, 10);
                    const filled = (b.inscrits || []).length;
                    const remaining = isNaN(needed) ? 0 : Math.max(0, needed - filled);

                    return (
                      <tr key={b.id}>
                        <td className="py-2 font-bold text-slate-900">{b.poste}</td>
                        <td className="py-2 text-slate-600">{b.creneau}</td>
                        <td className="py-2 text-slate-600">
                          {b.nombre} pers.
                          {remaining > 0 ? (
                            <span className="ml-1 text-[10px] text-amber-700 font-semibold">({remaining} manquant{remaining > 1 ? "s" : ""})</span>
                          ) : (
                            <span className="ml-1 text-[10px] text-emerald-700 font-semibold">(Complet)</span>
                          )}
                        </td>
                        <td className="py-2 border-b border-dashed border-slate-300 text-slate-800">
                          {registeredNames || (
                            <span className="text-slate-400">______________________</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Signatures Footer for print */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-xs">
            <div>
              <span className="block font-bold text-slate-700 uppercase text-[10px]">
                Le Responsable d'Organisation :
              </span>
              <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
            </div>
            <div>
              <span className="block font-bold text-slate-700 uppercase text-[10px]">
                Visa Délégué FFR / Arbitre :
              </span>
              <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
