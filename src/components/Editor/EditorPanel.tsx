/**
 * Editor panel with tabs: Form | YAML.
 * The ErrorPanel is shared between both modes and shown below.
 */
import { useCvStore } from "@/store/cvStore";
import { YamlEditor } from "./YamlEditor";
import { ErrorPanel } from "./ErrorPanel";
import { CvForm } from "@/components/Form/CvForm";

export function EditorPanel() {
  const editorMode = useCvStore((s) => s.editorMode);
  const setEditorMode = useCvStore((s) => s.setEditorMode);
  const yamlString = useCvStore((s) => s.yamlString);
  const setYaml = useCvStore((s) => s.setYaml);
  const errors = useCvStore((s) => s.errors);

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-line bg-paper-raised">
        <button
          type="button"
          onClick={() => setEditorMode("form")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition ${
            editorMode === "form"
              ? "border-b-2 border-signal text-ink"
              : "text-ink-soft hover:text-ink"
          }`}
        >
          Form
        </button>
        <button
          type="button"
          onClick={() => setEditorMode("yaml")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition ${
            editorMode === "yaml"
              ? "border-b-2 border-signal text-ink"
              : "text-ink-soft hover:text-ink"
          }`}
        >
          YAML
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {editorMode === "form" ? (
          <CvForm />
        ) : (
          <YamlEditor value={yamlString} onChange={setYaml} />
        )}
      </div>

      {/* Shared error panel */}
      {errors.length > 0 && <ErrorPanel errors={errors} />}
    </div>
  );
}
