export type LinkKind = "sheets" | "docs" | "slides" | "forms" | "drive" | "looker-studio" | "monday" | "link";

interface KindRule {
  kind: Exclude<LinkKind, "link">;
  label: string;
  matches: (url: URL) => boolean;
}

const googleDocs = (path: string) => (url: URL) =>
  url.hostname === "docs.google.com" && url.pathname.startsWith(`/${path}`);

// First match wins. To support a new app, add a rule here and a logo in KindIcon.astro.
const rules: KindRule[] = [
  { kind: "sheets", label: "Google Sheet", matches: googleDocs("spreadsheets") },
  { kind: "docs", label: "Google Doc", matches: googleDocs("document") },
  { kind: "slides", label: "Google Slides", matches: googleDocs("presentation") },
  { kind: "forms", label: "Google Form", matches: (u) => googleDocs("forms")(u) || u.hostname === "forms.gle" },
  { kind: "drive", label: "Google Drive", matches: (u) => u.hostname === "drive.google.com" },
  {
    kind: "looker-studio",
    label: "Looker Studio report",
    matches: (u) => u.hostname === "lookerstudio.google.com" || u.hostname === "datastudio.google.com",
  },
  {
    kind: "monday",
    label: "Monday.com",
    matches: (u) => u.hostname === "monday.com" || u.hostname.endsWith(".monday.com"),
  },
];

export const linkKindLabel: Record<LinkKind, string> = {
  ...(Object.fromEntries(rules.map((r) => [r.kind, r.label])) as Record<KindRule["kind"], string>),
  link: "External link",
};

// Infer which app a link opens so the list can show that app's logo.
export function linkKind(href: string): LinkKind {
  const url = new URL(href);
  return rules.find((r) => r.matches(url))?.kind ?? "link";
}
