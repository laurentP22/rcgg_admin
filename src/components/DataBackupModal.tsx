import React, { useState } from "react";
import { EventItem, DEFAULT_SAMPLE_EVENTS } from "../types";
import { Download, Upload, RotateCcw, X, Check, AlertTriangle, FileJson } from "lucide-react";

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName: string;
  events: EventItem[];
  onImportData: (clubName: string, events: EventItem[]) => void;
  onResetData: () => void;
  onShowToast: (msg: string) => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  clubName,
  events,
  onImportData,
  onResetData,
  onShowToast,
}) => {
  const [jsonInput, setJsonInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export JSON file
  const handleExportJSON = () => {
    const data = {
      version: 1,
      clubName,
      exportedAt: new Date().toISOString(),
      events,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feuille-de-match-${clubName.toLowerCase().replace(/[^a-z0-9]/g, "_")}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast("Sauvegarde JSON téléchargée avec succès !");
  };

  // Import JSON file from file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || !Array.isArray(parsed.events)) {
          throw new Error("Format JSON invalide (clé 'events' manquante).");
        }
        onImportData(parsed.clubName || clubName, parsed.events);
        onShowToast(`${parsed.events.length} événements importés avec succès !`);
        onClose();
      } catch (err: any) {
        setImportError(err.message || "Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  };

  // Import JSON from textarea
  const handleTextareaImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed || !Array.isArray(parsed.events)) {
        throw new Error("Le texte JSON doit contenir un tableau 'events'.");
      }
      onImportData(parsed.clubName || clubName, parsed.events);
      onShowToast(`${parsed.events.length} événements importés !`);
      onClose();
    } catch (err: any) {
      setImportError(err.message || "JSON non valide");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-[#122A54] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-rose-400" />
            <h3 className="font-heading font-bold text-lg">
              Sauvegardes &amp; Partage des données
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          {/* Export section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#122A54]" />
              1. Télécharger la sauvegarde du club
            </h4>
            <p className="text-slate-500 mb-3">
              Enregistre un fichier JSON avec toutes vos fiches, tâches, listes de matériel et bénévoles.
            </p>
            <button
              onClick={handleExportJSON}
              className="bg-[#122A54] hover:bg-[#1B3B73] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter le fichier JSON ({events.length} événements)
            </button>
          </div>

          {/* Import section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600" />
              2. Importer une sauvegarde
            </h4>
            <p className="text-slate-500">
              Restaurez une sauvegarde reçue d'un autre membre du club ou synchronisez un autre appareil.
            </p>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">
                Fichier JSON depuis votre ordinateur / téléphone :
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <label className="block font-semibold mb-1 text-slate-700">
                Ou collez directement le texte JSON ci-dessous :
              </label>
              <textarea
                rows={3}
                placeholder='{"clubName": "...", "events": [...]}'
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setImportError(null);
                }}
                className="w-full bg-white border border-slate-300 rounded p-2 font-mono text-[11px]"
              />
              {importError && (
                <div className="text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {importError}
                </div>
              )}
              {jsonInput.trim() && (
                <button
                  onClick={handleTextareaImport}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-semibold cursor-pointer"
                >
                  Valider l'import du texte
                </button>
              )}
            </div>
          </div>

          {/* Reset section */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-bold text-sm text-red-900 mb-1 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-red-600" />
              3. Réinitialiser les données de démonstration
            </h4>
            <p className="text-red-700/80 mb-3">
              Remplace les données actuelles par les 3 événements types de rugby (Match Senior à domicile, Plateau EDR, Repas supporters).
            </p>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Êtes-vous sûr de vouloir recharger les événements de démonstration ?"
                  )
                ) {
                  onResetData();
                  onClose();
                }
              }}
              className="bg-white border border-red-300 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
            >
              Recharger les exemples
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
