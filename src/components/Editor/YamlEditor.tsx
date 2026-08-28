/**
 * YAML editor component using Monaco Editor.
 */
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor, MarkerSeverity } from "monaco-editor";
import { useCvStore } from "@/store/cvStore";
import type { ParseError } from "@/yaml/parser";

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function YamlEditor({ value, onChange }: YamlEditorProps) {
  const errors = useCvStore((s) => s.errors);

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Update markers when errors change
    updateMarkers(editor, monaco, errors);
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={value}
        onChange={(val) => onChange(val ?? "")}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}

/**
 * Update Monaco markers based on parse errors.
 */
function updateMarkers(
  editor: MonacoEditor.IStandaloneCodeEditor,
  monaco: typeof import("monaco-editor"),
  errors: ParseError[],
) {
  const model = editor.getModel();
  if (!model) return;

  const markers: MonacoEditor.IMarkerData[] = errors
    .filter((e) => e.line !== undefined)
    .map((err) => ({
      startLineNumber: err.line ?? 1,
      startColumn: err.column ?? 1,
      endLineNumber: err.line ?? 1,
      endColumn: (err.column ?? 1) + 10,
      message: err.message,
      severity:
        err.kind === "syntax"
          ? (monaco.MarkerSeverity.Error as MarkerSeverity)
          : (monaco.MarkerSeverity.Warning as MarkerSeverity),
    }));

  monaco.editor.setModelMarkers(model, "cv-for-all", markers);
}
