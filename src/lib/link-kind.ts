export type LinkKind = "sheet" | "doc" | "slides" | "report" | "link";

export const linkKindLabel: Record<LinkKind, string> = {
  sheet: "Google Sheet",
  doc: "Google Doc",
  slides: "Google Slides",
  report: "Looker Studio report",
  link: "External link",
};

// Infer what kind of file a link points to so the list can show a matching icon.
export function linkKind(url: string): LinkKind {
  if (url.includes("docs.google.com/spreadsheets")) return "sheet";
  if (url.includes("docs.google.com/document")) return "doc";
  if (url.includes("docs.google.com/presentation")) return "slides";
  if (url.includes("lookerstudio.google.com")) return "report";
  return "link";
}
