import React, { useState } from "react";
import { motion } from "motion/react";
import { Calendar, Bell, Plus, CheckSquare, Square, Trash2, Clock, AlertTriangle } from "lucide-react";
import { Reminder } from "../types";

interface RemindersListProps {
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
}

export default function RemindersList({
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder
}: RemindersListProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [schemeName, setSchemeName] = useState("PM Vidyalakshmi Scheme");
  const [dueDate, setDueDate] = useState("2026-09-30");
  const [type, setType] = useState<'Deadline' | 'Certificate Expiry' | 'Follow-up'>("Deadline");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      title,
      schemeName,
      dueDate,
      type,
      completed: false
    };

    onAddReminder(newReminder);
    setTitle("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-[#004d99] w-6 h-6" />
            <span>Deadlines & Reminders System</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track registration deadlines, coordinate certificate renewals, and get proactive follow-up alerts.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="h-10 px-4 bg-[#004d99] hover:bg-[#00366c] text-white rounded-full flex items-center gap-1.5 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Add Reminder Box */}
        {showAdd && (
          <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-fit space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#004d99]" />
              <span>Create Notification Event</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-600 block mb-1">Reminder Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Renew Income Certificate"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Related Scheme Name</label>
                <input
                  type="text"
                  placeholder="e.g. PM-KISAN"
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Action Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                >
                  <option value="Deadline">Deadline</option>
                  <option value="Certificate Expiry">Certificate Expiry</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 h-9 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 bg-[#004d99] hover:bg-[#00366c] text-white rounded-lg font-semibold cursor-pointer"
                >
                  Set Alarm
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reminders schedule timeline list */}
        <div className={`${showAdd ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {reminders.length === 0 ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center min-h-[250px]">
                <Bell className="w-12 h-12 text-gray-300 mb-3 animate-bounce" />
                <p className="font-semibold text-gray-700">No Reminders Scheduled</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                  All caught up! Apply to schemes or click "Add Reminder" to construct customized renewal alarms.
                </p>
              </div>
            ) : (
              reminders.map((rem) => {
                // Determine color indicators based on type
                const isExpiry = rem.type === "Certificate Expiry";
                const isDeadline = rem.type === "Deadline";

                return (
                  <div 
                    key={rem.id}
                    className={`p-5 flex gap-4 items-start hover:bg-gray-50/40 transition-colors ${
                      rem.completed ? "opacity-60" : ""
                    }`}
                  >
                    {/* Completion checkbox */}
                    <button
                      onClick={() => onToggleReminder(rem.id)}
                      className="text-[#004d99] hover:text-[#00366c] transition-transform active:scale-95 cursor-pointer pt-0.5 shrink-0"
                    >
                      {rem.completed ? (
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Metadata text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className={`text-base font-bold text-gray-900 leading-snug ${
                            rem.completed ? "line-through text-gray-400" : ""
                          }`}>
                            {rem.title}
                          </h4>
                          <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                            Scheme: <span className="text-gray-700 font-bold">{rem.schemeName}</span>
                          </span>
                        </div>

                        {/* Alarm Type Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          isExpiry ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          isDeadline ? "bg-red-50 text-red-700 border border-red-100" :
                          "bg-blue-50 text-[#004d99] border border-blue-100"
                        }`}>
                          {rem.type}
                        </span>
                      </div>

                      {/* Timeline status indicator info */}
                      <div className="flex items-center gap-3 mt-4 text-xs font-semibold">
                        <div className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due Date: {rem.dueDate}</span>
                        </div>

                        {!rem.completed && (
                          <div className={`flex items-center gap-1 ${
                            isDeadline ? "text-red-600 bg-red-50 px-2.5 py-1 rounded-lg" : "text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg"
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Action Required Soon</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trash bin action */}
                    <button
                      onClick={() => onDeleteReminder(rem.id)}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
