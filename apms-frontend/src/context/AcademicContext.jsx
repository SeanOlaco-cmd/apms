import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const Ctx = createContext(null);

// Loads the reference data every role page needs (academic periods, schools,
// programs, and the departmental-achievement modules) and owns the
// "AY 2026–2027" selector shown on every page.
export function AcademicProvider({ children }) {
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);
  const [periods, setPeriods] = useState([]);
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modules, setModules] = useState([]);
  const [year, setYear] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const calls = [api.get("/academic-periods"), api.get("/schools"), api.get("/programs")];
    if (["dean", "vpaa", "president"].includes(user?.role)) calls.push(api.get("/achievement-modules"));
    Promise.all(calls.map((p) => p.catch(() => ({ data: [] })))).then(([p, s, g, m]) => {
      if (!alive) return;
      setPeriods(p.data); setSchools(s.data); setPrograms(g.data); setModules(m?.data ?? []);
      setReady(true);
    });
    return () => { alive = false; };
  }, [user?.role]);

  const activePeriod = periods.find((p) => p.is_active) || null;
  const years = useMemo(
    () => [...new Set(periods.map((p) => p.school_year))].sort().reverse(),
    [periods]
  );

  useEffect(() => {
    if (!year && periods.length) setYear(activePeriod?.school_year || years[0] || "");
  }, [periods, year, activePeriod, years]);

  const value = {
    user, periods, schools, programs, modules, year, setYear, years, activePeriod, ready,
    school: schools.find((s) => s.id == user?.school_id) || null,
    program: programs.find((g) => g.id == user?.program_id) || null,
    schoolPrograms: (schoolId) => programs.filter((g) => g.school_id == schoolId && g.is_active !== false),
    inYear: (row) => !year || (row?.academic_period?.school_year ?? "") === year,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAcademic = () => useContext(Ctx);