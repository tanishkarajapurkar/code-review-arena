import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Columns, AlignJustify, GitCompare, ArrowRight } from 'lucide-react';

export const MonacoDiffViewer = ({
  versions = [],
  language = 'javascript',
  initialOriginalVersion = 1,
  initialModifiedVersion = 2,
  height = '500px',
}) => {
  const [originalVerNum, setOriginalVerNum] = useState(initialOriginalVersion);
  const [modifiedVerNum, setModifiedVerNum] = useState(
    initialModifiedVersion > initialOriginalVersion
      ? initialModifiedVersion
      : versions.length > 1
      ? 2
      : 1
  );
  const [isSideBySide, setIsSideBySide] = useState(true);

  const originalDoc =
    versions.find((v) => v.versionNumber === Number(originalVerNum)) || versions[0] || {};
  const modifiedDoc =
    versions.find((v) => v.versionNumber === Number(modifiedVerNum)) ||
    versions[versions.length - 1] ||
    {};

  const mapLanguage = (lang) => {
    const l = (lang || '').toLowerCase();
    if (l === 'react' || l === 'jsx') return 'javascript';
    if (l === 'tsx') return 'typescript';
    if (l === 'js') return 'javascript';
    if (l === 'py') return 'python';
    return l;
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-2xl">
      {/* Diff Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold font-mono">
            <GitCompare className="w-4 h-4" />
            <span>Code Diff</span>
          </div>

          {/* Select version A */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Compare</span>
            <select
              value={originalVerNum}
              onChange={(e) => setOriginalVerNum(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            >
              {versions.map((v) => (
                <option key={v.versionNumber} value={v.versionNumber}>
                  v{v.versionNumber} (Snapshot)
                </option>
              ))}
            </select>

            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />

            {/* Select version B */}
            <select
              value={modifiedVerNum}
              onChange={(e) => setModifiedVerNum(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            >
              {versions.map((v) => (
                <option key={v.versionNumber} value={v.versionNumber}>
                  v{v.versionNumber} (Revision)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View mode toggle (Side-by-side vs Inline unified) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5 border border-slate-700">
            <button
              onClick={() => setIsSideBySide(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isSideBySide
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setIsSideBySide(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                !isSideBySide
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignJustify className="w-3 h-3" />
              <span>Unified</span>
            </button>
          </div>
        </div>
      </div>

      {/* Changelog banner between versions */}
      {modifiedDoc.changelog && (
        <div className="px-4 py-2 bg-slate-850 border-b border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
          <span className="truncate">
            <strong className="text-indigo-400 font-mono">v{modifiedVerNum} Changelog:</strong>{' '}
            {modifiedDoc.changelog}
          </span>
          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
            Uploaded by {modifiedDoc.uploadedBy?.name || 'Author'}
          </span>
        </div>
      )}

      {/* Monaco Diff Editor Instance */}
      <DiffEditor
        height={height}
        language={mapLanguage(language)}
        original={originalDoc.code || ''}
        modified={modifiedDoc.code || ''}
        theme="vs-dark"
        options={{
          readOnly: true,
          renderSideBySide: isSideBySide,
          fontSize: 13,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          diffWordWrap: 'on',
        }}
      />
    </div>
  );
};
