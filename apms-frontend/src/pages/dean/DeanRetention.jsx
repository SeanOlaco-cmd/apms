import DeanReviewPage from "../../components/DeanReviewPage";
import StudentCasesSection from "../../components/StudentCasesSection";

const columns = [
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Retention Rate", render: (r) => `${r.retention_rate}%`, className: "text-green-600 font-semibold" },
  { label: "Continuing", render: (r) => r.continuing_students },
  { label: "Dropped", render: (r) => r.dropped_students, className: "text-red-500" },
  { label: "Transferred Out", render: (r) => r.transferred_students, className: "text-amber-600" },
];

export default function DeanRetention() {
  return (
    <div className="flex flex-col gap-6">
      <StudentCasesSection caseTypes={["dropout", "transfer_school"]} dhMode={false} />
      <DeanReviewPage
        title="Retention Submissions 📈"
        subtitle="Review and approve retention data. Dropped and Transferred Out counts come from each DH's logged student cases above."
        uri="/retention"
        columns={columns}
      />
    </div>
  );
}