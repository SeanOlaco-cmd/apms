import DeanReviewPage from "../../components/DeanReviewPage";

const columns = [
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Retention Rate", render: (r) => `${r.retention_rate}%`, className: "text-green-600 font-semibold" },
  { label: "Continuing", render: (r) => r.continuing_students },
  { label: "Dropped", render: (r) => r.dropped_students, className: "text-red-500" },
];

export default function DeanRetention() {
  return (
    <DeanReviewPage
      title="Retention Submissions 📈"
      subtitle="Review and approve retention data."
      uri="/retention"
      columns={columns}
    />
  );
}