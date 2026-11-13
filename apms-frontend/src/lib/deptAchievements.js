// Helpers for the Departmental Achievements / Board Exams screens.
// A module's `fields` config (from the database) decides what the form asks for.

// "LET Passers" -> "LET Passer", "Board Exams" -> "Board Exam"
export const singularName = (name = "") => name.replace(/s$/i, "");

// Options may be plain values (1, "1st Year") or { value, label }.
export function optionList(field) {
  return (field.options ?? []).map((o) => {
    if (typeof o === "object") return o;
    return { value: String(o), label: field.key === "topcit_level" ? `Level ${o}` : String(o) };
  });
}

export const blankValues = (module) =>
  Object.fromEntries((module?.fields ?? []).map((f) => [f.key, ""]));

export const columnsOf = (module) => (module?.fields ?? []).filter((f) => f.key !== "notes");

// What a table cell shows for one field of one record.
export function cellValue(record, field, programs = []) {
  const raw = record?.[field.key];
  if (raw === null || raw === undefined || raw === "") return "—";
  if (field.key === "topcit_level") return `Level ${raw}`;
  if (field.type === "program") {
    const p = record.program ?? programs.find((g) => g.id === raw);
    return p?.code ?? "—";
  }
  return String(raw);
}

// Record -> form values (used when the Dean edits a rejected record).
export function valuesFromRecord(module, record) {
  return Object.fromEntries((module?.fields ?? []).map((f) => {
    const v = record[f.key];
    return [f.key, v === null || v === undefined ? "" : String(v)];
  }));
}

// Form values -> API payload ("" becomes null, numbers become numbers).
export function payloadFromValues(module, values) {
  const out = {};
  (module?.fields ?? []).forEach((f) => {
    const v = values[f.key];
    if (v === "" || v === undefined) out[f.key] = null;
    else if (f.key === "topcit_level" || f.key === "program_id") out[f.key] = Number(v);
    else out[f.key] = typeof v === "string" ? v.trim() : v;
  });
  return out;
}

// Required fields still empty -> disables the submit button.
export const missingRequired = (module, values) =>
  (module?.fields ?? []).some((f) => f.required && String(values[f.key] ?? "").trim() === "");