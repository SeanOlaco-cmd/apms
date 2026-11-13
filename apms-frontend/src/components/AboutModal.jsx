import { useEffect } from "react";

const TEAM = [
  "Alegado, Bren Julius L.",
  "Binos, Kenzhen Lee C.",
  "Negrete, Lynneth M.",
  "Olaco, Sean Patrick D.",
];

const FLOW = [
  { who: "Department Head", what: "encodes and submits program data" },
  { who: "School Dean", what: "reviews and pre-approves it" },
  { who: "VPAA", what: "gives final approval" },
  { who: "College President", what: "views the approved data as charts and reports" },
];

const STACK = ["Laravel", "React", "MySQL", "Tailwind CSS", "Laravel Sanctum"];

export default function AboutModal({ onClose }) {
  // Close on Escape, like the Settings modal behaves with its backdrop.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">About APMS</h2>
          <button onClick={onClose} aria-label="Close"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 text-sm text-gray-600">
          <div>
            <h3 className="text-base font-semibold text-[#7b1113]">
              Academic Performance Monitoring System
            </h3>
            <p className="text-gray-500">City College of Tagaytay</p>
            <p className="mt-2">
              A web-based platform that consolidates the academic reports prepared by each school
              and department into one centralized dashboard, so the VPAA and the College President
              can review accurate, up-to-date information without manual report consolidation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">How data moves</h4>
            <ol className="flex flex-col gap-1.5">
              {FLOW.map((s, i) => (
                <li key={s.who} className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#7b1113] text-white text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span><span className="font-medium text-gray-800">{s.who}</span> {s.what}.</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Developed by</h4>
            <ul className="flex flex-col gap-0.5">
              {TEAM.map((n) => <li key={n}>{n}</li>)}
            </ul>
            <p className="mt-2 text-gray-500">
              Adviser: Ms. Jeferlyn A. Anonuevo<br />
              School of Computer Studies — Bachelor of Science in Information Technology
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Built with</h4>
            <div className="flex flex-wrap gap-2">
              {STACK.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose}
            className="bg-[#7b1113] text-white text-sm font-semibold py-2 px-5 rounded-lg hover:bg-[#5e0d0f] transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}