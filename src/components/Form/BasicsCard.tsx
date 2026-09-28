/**
 * Card for editing the basic CV header: name, headline, location, email,
 * phone, website, photo. Email/phone/website accept either a scalar or a
 * list; the form always uses the list editor and serializes accordingly.
 */
import { useMemo } from "react";
import { useCvStore } from "@/store/cvStore";
import { useT } from "@/i18n";
import {
  loadDoc,
  getCvBasics,
  setScalar,
  setStringList,
} from "@/yaml/doc-editor";
import { TextField } from "./fields/TextField";
import { StringListField } from "./fields/StringListField";
import { Card } from "./Card";

export function BasicsCard() {
  const yamlString = useCvStore((s) => s.yamlString);
  const setYaml = useCvStore((s) => s.setYaml);
  const errors = useCvStore((s) => s.errors);
  const t = useT();

  const basics = useMemo(() => {
    const { doc } = loadDoc(yamlString);
    if (!doc) return null;
    return getCvBasics(doc);
  }, [yamlString]);

  if (!basics) return null;

  const errorFor = (path: string) =>
    errors.find((e) => e.path === path)?.message;

  const updateScalar = (key: string, value: string) => {
    const next = setScalar(yamlString, ["cv", key], value);
    if (next !== null) setYaml(next);
  };

  const updateList = (key: string, values: string[]) => {
    const next = setStringList(yamlString, ["cv", key], values);
    if (next !== null) setYaml(next);
  };

  return (
    <Card title={t("Header")} defaultOpen>
      <div className="flex flex-col gap-3">
        <TextField
          label={t("Name")}
          value={basics.name}
          onChange={(v) => updateScalar("name", v)}
          placeholder={t("Jane Doe")}
          error={errorFor("cv.name")}
        />
        <TextField
          label={t("Headline")}
          value={basics.headline}
          onChange={(v) => updateScalar("headline", v)}
          placeholder={t("Software Engineer")}
          error={errorFor("cv.headline")}
        />
        <TextField
          label={t("Location")}
          value={basics.location}
          onChange={(v) => updateScalar("location", v)}
          placeholder={t("San Francisco, CA")}
          error={errorFor("cv.location")}
        />
        <StringListField
          label={t("Email")}
          values={basics.email}
          onChange={(v) => updateList("email", v)}
          placeholder={t("jane@example.com")}
          error={errorFor("cv.email")}
        />
        <StringListField
          label={t("Phone")}
          values={basics.phone}
          onChange={(v) => updateList("phone", v)}
          placeholder={t("+1 555 555 5555")}
          error={errorFor("cv.phone")}
        />
        <StringListField
          label={t("Website")}
          values={basics.website}
          onChange={(v) => updateList("website", v)}
          placeholder={t("https://jane.com")}
          error={errorFor("cv.website")}
        />
        <TextField
          label={t("Photo (URL or base64)")}
          value={basics.photo}
          onChange={(v) => updateScalar("photo", v)}
          placeholder={t("https://… or data:image/…")}
          error={errorFor("cv.photo")}
          monospace
        />
      </div>
    </Card>
  );
}
