// Domain constants and labels used across the role pages.

export const RETENTION_TYPES = [
  { value: "dropped", label: "Dropped" },
  { value: "transferee_in", label: "Transferee In" },
  { value: "transferee_out", label: "Transferee Out" },
  { value: "shiftee_in", label: "Shiftee In" },
  { value: "shiftee_out", label: "Shiftee Out" },
];

export const RETENTION_REASONS = [
  "Financial difficulties",
  "Health reasons",
  "Family relocation",
  "Employment / family concerns",
  "Academic reasons",
  "Change of career interest",
  "Transferred from another college",
  "Shifted from another program",
  "Relocation to another city",
  "Work commitments",
  "Other",
];

export const FACULTY_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
];
export const FACULTY_POSITIONS = [
  { value: "department_head", label: "Department Head" },
  { value: "coordinator", label: "Coordinator" },
  { value: "dean", label: "Dean" },
  { value: "faculty", label: "Faculty" },
];
export const FACULTY_DEGREES = [
  { value: "bachelors", label: "Bachelor's degree" },
  { value: "masters", label: "Masteral" },
  { value: "doctorate", label: "Doctorate" },
];

export const VERDICTS = [
  { value: "complied", label: "Class conducted as scheduled", badge: "b-approved" },
  { value: "cancelled_by_instructor", label: "Class cancelled by instructor", badge: "b-rejected" },
  { value: "early_dismissal", label: "Early dismissal by the instructor", badge: "b-shiftee_out" },
  { value: "instructor_unavailable", label: "Instructor is unavailable", badge: "b-pending" },
];

export const SECTIONS = ["A", "B", "C", "D", "E", "F"];
export const ENROLLMENT_YEARS = [1, 2, 3, 4];
export const yearLabel = (y) => ["", "1st Year", "2nd Year", "3rd Year", "4th Year"][y] ?? `${y}th Year`;

export const labelOf = (list, value) => list.find((x) => x.value === value)?.label ?? value ?? "—";

// Short chip labels used in the filter pills (BSIT -> IT, BSED-ENG -> English …).
const CHIPS = {
  BSIT: "IT", BSCS: "CS",
  "BSED-ENG": "English", "BSED-FIL": "Filipino", "BSED-MATH": "Math", "BSED-SS": "Social Studies",
  BSHM: "HM", BSTM: "TM", "BSBA-MM": "Marketing", "BSBA-HRDM": "HRDM", BSOA: "OA",
};
export const programChip = (p) => CHIPS[p?.code] ?? p?.code ?? "—";
export const isMajor = (p) => (p?.code ?? "").startsWith("BSED-");

// "2021–2022 to 2024–2025" style ranges for "school year attended".
export function schoolYearRanges(count = 9) {
  const now = new Date();
  const currentStart = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: count }, (_, i) => {
    const s = currentStart - 4 - i;
    return `${s}–${s + 1} to ${s + 3}–${s + 4}`;
  });
}

// Status chip text/colour. `flow` is "three" for DH-submitted reports
// (DH → Dean → VPAA) and "dean" for Dean-submitted records (Dean → VPAA).
export function statusMeta(status, { viewer = "dh", flow = "three" } = {}) {
  if (status === "approved") return ["Approved", "b-approved"];
  if (status === "rejected") return ["Rejected", "b-rejected"];
  if (flow === "dean" || status === "dean_approved") {
    return viewer === "vpaa" ? ["Pending", "b-pending"] : ["Awaiting VPAA", "b-awaiting"];
  }
  return viewer === "vpaa" ? ["Awaiting Dean", "b-neutral"] : ["Pending", "b-pending"];
}