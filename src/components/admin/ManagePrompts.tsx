import React, { useState } from 'react';
import { Search, Edit, Trash2, Star, ShieldAlert, AlertTriangle, Loader2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PromptItem } from '../../types';
import { CATEGORIES } from '../../config/categories';

interface ManagePromptsProps {
  onEditInStudio: (prompt: PromptItem) => void;
}

export const ManagePrompts: React.FC<ManagePromptsProps> = ({ onEditInStudio }) => {
  const { allPrompts, updatePrompt, deleteUserPrompt, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [promptToDelete, setPromptToDelete] = useState<PromptItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique categories from allPrompts (including custom categories)
  const availableCategories = Array.from(
    new Set([...CATEGORIES, ...allPrompts.map((p) => p.category).filter(Boolean)])
  );

  const filteredPrompts = allPrompts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleToggleFeatured = async (p: PromptItem) => {
    try {
      await updatePrompt(p.id, { isFeatured: !p.isFeatured });
      addToast(
        !p.isFeatured ? 'Pinned as Featured Prompt!' : 'Unpinned from Featured',
        'info',
        p.title
      );
    } catch (err: any) {
      addToast('Failed to toggle featured status', 'error', err.message);
    }
  };

  const confirmDelete = async () => {
    if (!promptToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUserPrompt(promptToDelete.id);
    } catch (err: any) {
      addToast('Failed to delete prompt', 'error', err.message);
    } finally {
      setIsDeleting(false);
      setPromptToDelete(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6 space-y-4 animate-in fade-in duration-200 relative">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prompt title or keywords..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl text-sm focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none"
        >
          <option value="All">All Categories ({allPrompts.length})</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Title & Details</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Featured</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredPrompts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No prompts match your search query or category filter.
                </td>
              </tr>
            ) : (
              filteredPrompts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-white text-xs truncate">{p.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{p.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-800 text-purple-300 rounded border border-slate-700 font-semibold">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                      p.status === 'published' || p.isPublic
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : p.status === 'scheduled'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {p.status || (p.isPublic ? 'published' : 'draft')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        p.isFeatured
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                      title={p.isFeatured ? 'Unpin Featured' : 'Pin as Featured'}
                    >
                      <Star className={`w-3.5 h-3.5 ${p.isFeatured ? 'fill-amber-400' : ''}`} />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEditInStudio(p)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        title="Edit in Studio"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPromptToDelete(p)}
                        className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg transition-colors"
                        title="Delete Prompt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {promptToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setPromptToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              disabled={isDeleting}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Prompt Confirmation</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to delete this prompt?
                </p>
                <div className="mt-2.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-rose-200 truncate">
                  "{promptToDelete.title}"
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  This action triggers real-time deletion in Firestore and local state. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPromptToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center space-x-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
