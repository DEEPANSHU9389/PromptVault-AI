import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PromptItem, CategoryType, DifficultyType } from '../../types';

interface BulkImporterProps {
  onImportComplete: () => void;
}

export const BulkImporter: React.FC<BulkImporterProps> = ({ onImportComplete }) => {
  const { currentUser, bulkImportPrompts, addToast } = useApp();
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);

  const handleParseBulk = () => {
    setBulkError('');
    if (!bulkInputText.trim()) {
      setBulkError('Please paste a JSON array string.');
      return;
    }
    try {
      const parsed = JSON.parse(bulkInputText);
      if (!Array.isArray(parsed)) {
        setBulkError('Invalid format: Root JSON element must be an array of prompt objects.');
        return;
      }
      setParsedPreview(parsed);
      addToast(`Parsed ${parsed.length} prompts ready for import`, 'info');
    } catch (err: any) {
      setBulkError(`JSON Parsing Error: ${err.message}`);
    }
  };

  const handleLoadSampleTemplate = () => {
    const sampleData = [
      {
        title: "Senior Product Marketing Copywriter",
        description: "Generate high-converting SaaS landing page section copy using the PAS framework.",
        prompt: "Act as a Lead Product Marketing Strategist. Write landing page copy for [Product Name] using the PAS framework. Target Audience: [ICP]. Problem: [Core Frustration]. Solution: [Key Feature].",
        category: "Marketing",
        tags: ["Landing Page", "PAS Framework", "Copywriting", "SaaS"],
        models: ["ChatGPT", "Claude", "Gemini"],
        difficulty: "Intermediate",
        rating: 4.9,
        usageCount: 1500,
        isFeatured: true,
        status: "published"
      },
      {
        title: "REST API Endpoint Design Specialist",
        description: "Specify clean RESTful endpoints, request/response JSON schemas, and HTTP status codes.",
        prompt: "Design a REST API specification for a resource called [Resource Name]. Include GET, POST, PUT, DELETE routes with headers, request parameters, JSON payloads, and error codes.",
        category: "Coding",
        tags: ["REST API", "Backend", "JSON Schema", "Architecture"],
        models: ["Claude", "ChatGPT"],
        difficulty: "Advanced",
        rating: 4.95,
        usageCount: 2200,
        isFeatured: true,
        status: "published"
      },
      {
        title: "SEO Keyword Intent Cluster Analyzer",
        description: "Group search keywords into semantic intent clusters with recommended content types.",
        prompt: "Analyze the following list of raw keywords: [Keywords]. Cluster them into 4 primary intent groups: Informational, Commercial, Navigational, Transactional.",
        category: "SEO",
        tags: ["SEO", "Keyword Clustering", "Search Intent"],
        models: ["Perplexity", "Gemini", "ChatGPT"],
        difficulty: "Intermediate",
        rating: 4.88,
        usageCount: 1800,
        isFeatured: false,
        status: "published"
      }
    ];

    setBulkInputText(JSON.stringify(sampleData, null, 2));
    setParsedPreview(sampleData);
    setBulkError('');
    addToast('Loaded Sample Tested Prompts Template!', 'success');
  };

  const handleExecuteBulkImport = async () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    setIsBulkImporting(true);
    try {
      const formattedPrompts: Omit<PromptItem, 'id'>[] = parsedPreview.map((item, idx) => ({
        title: item.title || `Imported Prompt ${idx + 1}`,
        description: item.description || '',
        prompt: item.prompt || '',
        category: (item.category || 'Productivity') as CategoryType,
        tags: Array.isArray(item.tags) ? item.tags : ['Imported'],
        models: Array.isArray(item.models) ? item.models : ['ChatGPT'],
        difficulty: (item.difficulty || 'Intermediate') as DifficultyType,
        rating: item.rating || 5.0,
        ratingCount: item.ratingCount || 1,
        usageCount: item.usageCount || 1,
        isFeatured: Boolean(item.isFeatured),
        isPublic: true,
        status: 'published',
        author: currentUser?.displayName || 'Admin Creator Studio',
        authorId: currentUser?.uid || 'admin',
        createdAt: new Date().toISOString().split('T')[0],
      }));

      const count = await bulkImportPrompts(formattedPrompts);
      addToast(`Successfully bulk imported ${count} prompts to Global Library!`, 'success');
      setBulkInputText('');
      setParsedPreview(null);
      onImportComplete();
    } catch (err: any) {
      console.error(err);
      setBulkError(err.message || 'Failed to execute bulk import');
    } finally {
      setIsBulkImporting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Upload className="w-5 h-5 text-purple-400" />
            <span>JSON Bulk Prompt Importer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Batch import multiple tested prompts into Firestore and global library in one click.
          </p>
        </div>

        <button
          onClick={handleLoadSampleTemplate}
          className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-xs rounded-xl transition-all flex items-center space-x-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-purple-400" />
          <span>Load Sample Tested Prompts</span>
        </button>
      </div>

      {bulkError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{bulkError}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span>Paste JSON Array Data</span>
          <span className="text-[11px] text-slate-500 font-mono">Format: Array of Prompt Objects</span>
        </label>
        <textarea
          rows={10}
          value={bulkInputText}
          onChange={(e) => setBulkInputText(e.target.value)}
          placeholder={`[\n  {\n    "title": "Senior Marketing Strategist",\n    "description": "PAS Landing Page Copy",\n    "prompt": "Act as a Senior Copywriter...",\n    "category": "Marketing"\n  }\n]`}
          className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 font-mono text-xs rounded-xl focus:outline-none leading-relaxed"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleParseBulk}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
        >
          Parse & Validate JSON
        </button>

        {parsedPreview && (
          <button
            onClick={handleExecuteBulkImport}
            disabled={isBulkImporting}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
          >
            {isBulkImporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Execute Bulk Import ({parsedPreview.length} Prompts)</span>
              </>
            )}
          </button>
        )}
      </div>

      {parsedPreview && (
        <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Validation Preview ({parsedPreview.length} Valid Items)
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {parsedPreview.map((item, i) => (
              <div key={i} className="p-2.5 bg-slate-900 rounded-lg text-xs flex items-center justify-between border border-slate-800">
                <span className="font-bold text-white truncate max-w-sm">{item.title || `Prompt ${i + 1}`}</span>
                <span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded text-[10px] font-semibold border border-purple-500/20">
                  {item.category || 'Productivity'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
