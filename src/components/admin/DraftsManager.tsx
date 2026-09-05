import React from 'react';
import { Edit, Calendar, Trash2, Globe, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PromptItem } from '../../types';

interface DraftsManagerProps {
  onEditInStudio: (prompt: PromptItem) => void;
}

export const DraftsManager: React.FC<DraftsManagerProps> = ({ onEditInStudio }) => {
  const { allPrompts, updatePrompt, deleteUserPrompt, addToast } = useApp();

  const draftPrompts = allPrompts.filter((p) => p.status === 'draft');
  const scheduledPrompts = allPrompts.filter((p) => p.status === 'scheduled');

  const handlePublishNow = async (p: PromptItem) => {
    try {
      await updatePrompt(p.id, {
        status: 'published',
        isPublic: true,
      });
      addToast('Published Prompt Live to Library!', 'success', p.title);
    } catch (err: any) {
      addToast('Failed to publish draft', 'error', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Drafts Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Edit className="w-4 h-4 text-amber-400" />
            <span>Private Draft Prompts ({draftPrompts.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Not visible to public library users</span>
        </div>

        {draftPrompts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No draft prompts saved yet. Use the Creator Studio to save drafts for future publishing.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftPrompts.map((p) => (
              <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-md uppercase">
                    Draft
                  </span>
                  <span className="text-[11px] text-slate-500">{p.createdAt}</span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{p.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{p.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditInStudio(p)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete draft "${p.title}"?`)) {
                          deleteUserPrompt(p.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handlePublishNow(p)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Releases Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Scheduled Release Queue ({scheduledPrompts.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Automated upcoming release dates</span>
        </div>

        {scheduledPrompts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No scheduled releases queued up. Set a scheduled date in the Creator Studio to queue releases.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledPrompts.map((p) => (
              <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold rounded-md uppercase">
                    Scheduled
                  </span>
                  <span className="text-[11px] text-blue-400 font-semibold">
                    Release: {p.scheduledAt ? new Date(p.scheduledAt).toLocaleString() : 'Pending'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{p.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{p.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onEditInStudio(p)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit / Reschedule</span>
                  </button>

                  <button
                    onClick={() => handlePublishNow(p)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
