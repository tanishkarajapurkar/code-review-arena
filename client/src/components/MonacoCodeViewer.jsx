import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export const MonacoCodeViewer = ({
  code = '',
  language = 'javascript',
  comments = [],
  selectedLine = null,
  onLineClick = () => {},
  readOnly = true,
  height = '500px',
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const mapLanguage = (lang) => {
    const l = (lang || '').toLowerCase();
    if (l === 'react' || l === 'jsx') return 'javascript';
    if (l === 'tsx') return 'typescript';
    if (l === 'js') return 'javascript';
    if (l === 'py') return 'python';
    return l;
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Listen to mouse down events in glyph margin or line numbers
    editor.onMouseDown((e) => {
      if (e.target && e.target.position) {
        const line = e.target.position.lineNumber;
        onLineClick(line);
      }
    });

    // Listen to cursor selection changes
    editor.onDidChangeCursorPosition((e) => {
      if (e.position) {
        onLineClick(e.position.lineNumber);
      }
    });

    applyDecorations();
  };

  const applyDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Aggregate comments by line
    const commentsByLine = {};
    comments.forEach((c) => {
      const line = c.lineNumber || c.lineRange?.start;
      if (line) {
        if (!commentsByLine[line]) {
          commentsByLine[line] = {
            count: 0,
            hasUnresolvedBlocker: false,
            categories: [],
          };
        }
        commentsByLine[line].count += 1;
        if (!c.isResolved && c.isBlocking) {
          commentsByLine[line].hasUnresolvedBlocker = true;
        }
        commentsByLine[line].categories.push(c.category);
      }
    });

    const newDecorations = [];

    // Add decorations for lines with comments
    Object.entries(commentsByLine).forEach(([lineStr, info]) => {
      const lineNum = parseInt(lineStr, 10);
      const isBlocker = info.hasUnresolvedBlocker;

      newDecorations.push({
        range: new monaco.Range(lineNum, 1, lineNum, 1),
        options: {
          isWholeLine: true,
          className: isBlocker ? 'line-comment-blocker-highlight' : 'line-comment-highlight',
          glyphMarginClassName: 'line-comment-glyph',
          glyphMarginHoverMessage: {
            value: `💬 **${info.count} comment${info.count > 1 ? 's' : ''}** (${info.categories.join(', ')})`,
          },
          overviewRuler: {
            color: isBlocker ? '#ef4444' : '#6366f1',
            position: monaco.editor.OverviewRulerLane.Right,
          },
        },
      });
    });

    // Highlight currently selected line if any
    if (selectedLine) {
      newDecorations.push({
        range: new monaco.Range(selectedLine, 1, selectedLine, 1),
        options: {
          isWholeLine: true,
          className: 'bg-indigo-500/20 border-l-4 border-indigo-400',
        },
      });
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  };

  useEffect(() => {
    applyDecorations();
  }, [comments, selectedLine, code]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-2xl">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 font-semibold text-slate-300">
            source.{mapLanguage(language) === 'javascript' ? 'js' : mapLanguage(language)}
          </span>
          <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-800 uppercase font-mono">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            💡 Click on any line number or gutter to start a comment
          </span>
          {selectedLine && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-medium">
              Line {selectedLine} Selected
            </span>
          )}
        </div>
      </div>

      {/* Monaco Editor Instance */}
      <Editor
        height={height}
        language={mapLanguage(language)}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          lineNumbers: 'on',
          glyphMargin: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: 'all',
          cursorStyle: 'line',
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};
