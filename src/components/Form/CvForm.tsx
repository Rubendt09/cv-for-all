/**
 * Root form component. Loads the YAML document and renders the cards.
 * Shows a banner if the YAML has a syntax error (with a button to switch
 * to YAML mode) or if it contains aliases/anchors (read-only mode).
 */
import { useMemo } from "react";
import { useCvStore } from "@/store/cvStore";
import { loadDoc, hasAliasesInCv } from "@/yaml/doc-editor";
import { BasicsCard } from "./BasicsCard";
import { ConnectionsCard } from "./ConnectionsCard";
import { SectionsCard } from "./SectionCard";

export function CvForm() {
  const yamlString = useCvStore((s) => s.yamlString);
  const setEditorMode = useCvStore((s) => s.setEditorMode);

  const status = useMemo(() => {
    const { doc, error } = loadDoc(yamlString);
    if (error || !doc) {
      return { kind: "error" as const, message: error ?? "Invalid YAML" };
    }
    if (hasAliasesInCv(doc)) {
      return {
        kind: "aliases" as const,
        message:
          "This YAML uses anchors/aliases inside cv:. The form is read-only to avoid corrupting it. Edit the YAML directly.",
      };
    }
    return { kind: "ok" as const };
  }, [yamlString]);

  if (status.kind !== "ok") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="rounded border border-error bg-error-soft px-4 py-3 text-sm text-error">
          {status.message}
        </div>
        <button
          type="button"
          onClick={() => setEditorMode("yaml")}
          className="rounded bg-signal px-3 py-1.5 text-sm font-semibold text-signal-contrast transition hover:brightness-110"
        >
          Switch to YAML editor
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3">
      <div className="flex flex-col gap-3">
        <BasicsCard />
        <ConnectionsCard />
        <SectionsCard />
      </div>
    </div>
  );
}
