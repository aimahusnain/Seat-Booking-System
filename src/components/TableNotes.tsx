"use client";

import { useState } from "react";
import { StickyNote, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TableNotesProps {
  tableId: string;
  initialNotes?: string;
}

export default function TableNotes({ tableId, initialNotes = "" }: TableNotesProps) {
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/tables/${tableId}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setShowNotesInput(false);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative ml-2">
      {/* Notes Icon Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowNotesInput(!showNotesInput);
        }}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          notes 
            ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-900" 
            : "bg-gray-200 hover:bg-gray-300 text-gray-600"
        }`}
        title={notes ? "View/Edit Notes" : "Add Notes"}
      >
        <StickyNote size={14} />
      </button>

      {/* Notes Modal */}
      <AnimatePresence>
        {showNotesInput && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowNotesInput(false)}
            />

            {/* Notes Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-2xl p-4 w-[90vw] max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <StickyNote size={18} className="text-yellow-500" />
                  Table Notes
                </h3>
                <button
                  onClick={() => setShowNotesInput(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[120px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add notes about this table (e.g., decorations, special requests, dietary restrictions...)"
                autoFocus
              />

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowNotesInput(false);
                    setNotes(initialNotes);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Notes Preview (if exists and not empty) */}
              {initialNotes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Current notes:</p>
                  <p className="text-sm text-gray-700 italic">&quot;{initialNotes}&quot;</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}