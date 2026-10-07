import React, { useState } from "react";
import {
  EventItem,
  TYPES,
  getTypeInfo,
  formatDateFrench,
} from "../types";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";

interface CalendarViewProps {
  events: EventItem[];
  onSelectEvent: (id: string) => void;
  onNewEventForDate: (dateIso: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectEvent,
  onNewEventForDate,
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const MOIS_LONG = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const JOURS_COURT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const shiftMonth = (delta: number) => {
    let m = currentMonth + delta;
    let y = currentYear;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const jumpToToday = () => {
    const n = new Date();
    setCurrentMonth(n.getMonth());
    setCurrentYear(n.getFullYear());
  };

  const isoDate = (d: Date): string => {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  };

  // Build 42 grid cells (Monday-start)
  const buildMonthCells = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    // (firstDay.getDay() + 6) % 7 gives 0 for Monday, 6 for Sunday
    const startOffset = (firstDay.getDay() + 6) % 7;
    const start = new Date(currentYear, currentMonth, 1 - startOffset);

    const cells: { date: Date; inMonth: boolean; iso: string }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + i
      );
      cells.push({
        date: d,
        inMonth: d.getMonth() === currentMonth,
        iso: isoDate(d),
      });
    }
    return cells;
  };

  const cells = buildMonthCells();
  const todayIso = isoDate(today);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6 animate-fadeIn">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C1272D] mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendrier des Rencontres &amp; Événements
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 capitalize">
            {MOIS_LONG[currentMonth]} {currentYear}
          </h2>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftMonth(-1)}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Mois précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={jumpToToday}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Aujourd'hui
          </button>

          <button
            onClick={() => shiftMonth(1)}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Mois suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Categories Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
        <span className="font-semibold text-slate-800 mr-1">Légende :</span>
        {TYPES.map((t) => (
          <div key={t.id} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: t.color }}
            />
            <span className="text-[11px] font-medium">{t.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-inner">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-[#122A54] text-white">
          {JOURS_COURT.map((day) => (
            <div
              key={day}
              className="py-2.5 text-center font-heading font-semibold text-xs uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Month days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 bg-slate-200">
          {cells.map((cell, idx) => {
            const isToday = cell.iso === todayIso;
            const dayEvents = events.filter((e) => e.date === cell.iso);

            return (
              <div
                key={idx}
                className={`min-h-[105px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors relative group ${
                  cell.inMonth ? "bg-white" : "bg-slate-50 opacity-55"
                } ${isToday ? "bg-rose-50/40 ring-2 ring-[#C1272D] ring-inset" : ""}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? "bg-[#C1272D] text-white font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  {/* Add Event shortcut on hover */}
                  <button
                    onClick={() => onNewEventForDate(cell.iso)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title={`Créer un événement le ${formatDateFrench(cell.iso)}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Events List */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                  {dayEvents.map((ev) => {
                    const ti = getTypeInfo(ev.type);
                    return (
                      <button
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev.id);
                        }}
                        className="w-full text-left px-2 py-1 rounded text-[11px] font-semibold text-white shadow-xs hover:brightness-110 active:scale-[0.98] transition-all truncate block cursor-pointer"
                        style={{ backgroundColor: ti.color }}
                        title={`${ev.nom} — ${ti.label}`}
                      >
                        <span className="truncate block">
                          {ev.horaire ? `${ev.horaire.split(" ")[0]} ` : ""}
                          {ev.nom}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
