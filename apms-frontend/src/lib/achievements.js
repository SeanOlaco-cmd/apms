// Shared helpers for the Achievements feature (DH form, Dean/VPAA review
// pages, and the President's highlights view) so they all agree on labels,
// colours and how a student's year/section is shown.

export const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

export const TYPE_OPTIONS = [
  { value: "research", label: "Research" },
  { value: "publication", label: "Publication" },
  { value: "award", label: "Award" },
  { value: "certification", label: "Certification" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" },
];

// Full class names (not built dynamically) so Tailwind can see them.
export const TYPE_STYLES = {
  research:      { chip: "bg-blue-100 text-blue-700",       bar: "bg-blue-500",    icon: "🔬" },
  publication:   { chip: "bg-indigo-100 text-indigo-700",   bar: "bg-indigo-500",  icon: "📰" },
  award:         { chip: "bg-amber-100 text-amber-700",     bar: "bg-amber-500",   icon: "🏅" },
  certification: { chip: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500", icon: "📜" },
  training:      { chip: "bg-teal-100 text-teal-700",       bar: "bg-teal-500",    icon: "🎯" },
  other:         { chip: "bg-gray-100 text-gray-700",       bar: "bg-gray-400",    icon: "⭐" },
};

// Records created before the recipient type existed are all faculty.
export const kindOf = (row) => row.recipient_type || "faculty";
export const isStudent = (row) => kindOf(row) === "student";
export const recipientLabel = (row) => (isStudent(row) ? "Student" : "Faculty");

// "3rd Year · Section A" for students, "" for faculty / when not filled in.
export const yearSection = (row) =>
  isStudent(row)
    ? [row.year_level, row.section ? `Section ${row.section}` : null].filter(Boolean).join(" · ")
    : "";

export const initials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

export const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d.length === 10 ? `${d}T00:00:00` : d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
};