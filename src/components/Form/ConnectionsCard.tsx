/**
 * Card for editing social_networks and custom_connections.
 */
import { useMemo } from "react";
import { useCvStore } from "@/store/cvStore";
import {
  loadDoc,
  getSocialNetworks,
  getCustomConnections,
  setSocialNetworkField,
  addSocialNetwork,
  deleteSocialNetwork,
  setCustomConnectionField,
  addCustomConnection,
  deleteCustomConnection,
} from "@/yaml/doc-editor";
import { SOCIAL_NETWORK_NAMES } from "./entry-fields";
import { Card } from "./Card";

export function ConnectionsCard() {
  const yamlString = useCvStore((s) => s.yamlString);
  const setYaml = useCvStore((s) => s.setYaml);
  const errors = useCvStore((s) => s.errors);

  const networks = useMemo(() => {
    const { doc } = loadDoc(yamlString);
    if (!doc) return [];
    return getSocialNetworks(doc);
  }, [yamlString]);

  const connections = useMemo(() => {
    const { doc } = loadDoc(yamlString);
    if (!doc) return [];
    return getCustomConnections(doc);
  }, [yamlString]);

  const errorFor = (path: string) =>
    errors.find((e) => e.path === path)?.message;

  const updateNetwork = (i: number, field: "network" | "username", value: string) => {
    const next = setSocialNetworkField(yamlString, i, field, value);
    if (next !== null) setYaml(next);
  };

  const updateConnection = (
    i: number,
    field: "fontawesome_icon" | "placeholder" | "url",
    value: string,
  ) => {
    const next = setCustomConnectionField(yamlString, i, field, value);
    if (next !== null) setYaml(next);
  };

  return (
    <Card title="Connections">
      <div className="flex flex-col gap-3">
        {/* Social networks */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
              Social networks
            </span>
            <button
              type="button"
              onClick={() => {
                const next = addSocialNetwork(yamlString);
                if (next !== null) setYaml(next);
              }}
              className="rounded border border-dashed border-line px-2 py-0.5 text-[11px] text-ink-soft transition hover:border-signal hover:text-signal"
            >
              + Add
            </button>
          </div>
          {networks.length === 0 && (
            <p className="text-[11px] text-ink-faint">No social networks.</p>
          )}
          {networks.map((n, i) => (
            <div key={i} className="flex items-start gap-1">
              <select
                value={n.network}
                onChange={(e) => updateNetwork(i, "network", e.target.value)}
                className="rounded border border-line bg-paper px-1.5 py-1.5 text-xs text-ink outline-none focus:border-signal"
              >
                {SOCIAL_NETWORK_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={n.username}
                onChange={(e) => updateNetwork(i, "username", e.target.value)}
                placeholder="username"
                className="flex-1 rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-signal"
              />
              <button
                type="button"
                onClick={() => {
                  const next = deleteSocialNetwork(yamlString, i);
                  if (next !== null) setYaml(next);
                }}
                title="Remove"
                className="rounded border border-line px-1.5 py-0.5 text-xs text-ink-soft transition hover:border-error hover:text-error"
              >
                ×
              </button>
            </div>
          ))}
          {errorFor("cv.social_networks") && (
            <span className="text-[11px] text-error">
              {errorFor("cv.social_networks")}
            </span>
          )}
        </div>

        {/* Custom connections */}
        <div className="flex flex-col gap-2 border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
              Custom connections
            </span>
            <button
              type="button"
              onClick={() => {
                const next = addCustomConnection(yamlString);
                if (next !== null) setYaml(next);
              }}
              className="rounded border border-dashed border-line px-2 py-0.5 text-[11px] text-ink-soft transition hover:border-signal hover:text-signal"
            >
              + Add
            </button>
          </div>
          {connections.length === 0 && (
            <p className="text-[11px] text-ink-faint">No custom connections.</p>
          )}
          {connections.map((c, i) => (
            <div key={i} className="flex flex-col gap-1 rounded border border-line bg-paper p-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-ink-faint">#{i + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = deleteCustomConnection(yamlString, i);
                    if (next !== null) setYaml(next);
                  }}
                  title="Remove"
                  className="rounded border border-line px-1.5 py-0.5 text-xs text-ink-soft transition hover:border-error hover:text-error"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={c.fontawesome_icon}
                onChange={(e) => updateConnection(i, "fontawesome_icon", e.target.value)}
                placeholder="Font Awesome icon (e.g. fa-globe)"
                className="w-full rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-signal"
              />
              <input
                type="text"
                value={c.placeholder}
                onChange={(e) => updateConnection(i, "placeholder", e.target.value)}
                placeholder="Placeholder text"
                className="w-full rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-signal"
              />
              <input
                type="text"
                value={c.url}
                onChange={(e) => updateConnection(i, "url", e.target.value)}
                placeholder="URL (optional)"
                className="w-full rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-signal"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
