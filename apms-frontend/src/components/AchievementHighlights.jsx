import {
  TYPE_STYLES,
  isStudent,
  recipientLabel,
  yearSection,
  initials,
  formatDate,
} from "../lib/achievements";

// "BSCS · 3rd Year · Section A" style line under a recipient's name.
const metaLine = (row) =>
  [row.school?.code, row.program?.code, isStudent(row) ? yearSection(row) : ""]
    .filter(Boolean)
    .join(" · ");

function LeadStory({ row, wide }) {
  const style = TYPE_STYLES[row.type] || TYPE_STYLES.other;
  return (
    <div
      className={`${wide ? "lg:col-span-3" : "lg:col-span-2"} relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-[#7b1113] to-[#4a0a0b] text-white p-7 min-h-[280px]
        flex flex-col justify-between shadow-sm`}
    >
      <div className="absolute -right-4 -top-6 text-[9rem] opacity-10 select-none leading-none">{style.icon}</div>

      <div className="relative">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide uppercase">Featured</span>
          <span className="px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold capitalize">{row.type}</span>
          <span className="px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold">{recipientLabel(row)}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold leading-tight">{row.achievement_title}</h3>
        {row.description && <p className="mt-3 text-red-100 text-sm line-clamp-3">{row.description}</p>}
      </div>

      <div className="relative mt-6 flex items-center gap-3">
        <div className="w-11 h-11 shrink-0 rounded-full bg-white text-[#7b1113] font-bold flex items-center justify-center">
          {initials(row.faculty_name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{row.faculty_name}</p>
          <p className="text-red-200 text-xs truncate">{metaLine(row)}</p>
        </div>
        <div className="ml-auto text-right text-xs text-red-200 shrink-0">
          {row.awarding_body && <p>{row.awarding_body}</p>}
          <p>{formatDate(row.date_awarded)}</p>
        </div>
      </div>
    </div>
  );
}

function StoryCard({ row }) {
  const style = TYPE_STYLES[row.type] || TYPE_STYLES.other;
  const meta = metaLine(row);
  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
      <div className={`h-1.5 ${style.bar}`} />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${style.chip}`}>
            {style.icon} {row.type}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            {recipientLabel(row)}
          </span>
        </div>

        <h4 className="font-semibold text-gray-800 leading-snug line-clamp-2">{row.achievement_title}</h4>
        {row.description && <p className="text-sm text-gray-500 line-clamp-2">{row.description}</p>}

        <div className="flex items-center gap-3 mt-auto pt-1">
          <div className="w-9 h-9 shrink-0 rounded-full bg-[#7b1113]/10 text-[#7b1113] text-sm font-bold flex items-center justify-center">
            {initials(row.faculty_name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{row.faculty_name}</p>
            {meta && <p className="text-xs text-gray-400 truncate">{meta}</p>}
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span className="truncate">{row.awarding_body || "—"}</span>
        <span className="shrink-0 ml-3">{formatDate(row.date_awarded)}</span>
      </div>
    </article>
  );
}

// `items` must already be sorted newest-first; the first becomes the
// featured lead story, the next two sit beside it, the rest fill the grid.
export default function AchievementHighlights({ items }) {
  if (!items.length) {
    return <p className="text-gray-400 text-sm">No achievements match these filters.</p>;
  }

  const [lead, ...others] = items;
  const side = others.slice(0, 2);
  const rest = others.slice(2);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <LeadStory row={lead} wide={side.length === 0} />
        {side.length > 0 && (
          <div className="flex flex-col gap-4">
            {side.map((row) => <StoryCard key={row.id} row={row} />)}
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((row) => <StoryCard key={row.id} row={row} />)}
        </div>
      )}
    </div>
  );
}