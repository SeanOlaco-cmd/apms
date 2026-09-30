import VPAAReviewPage from "../../components/VPAAReviewPage";

const columns = [
  { label: "Program", render: (r) => r.program?.code },
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Retention Rate", render: (r) => `${r.retention_rate}%`, className: "text-green-600 font-semibold" },
  { label: "Continuing", render: (r) => r.continuing_students },
  { label: "Dropped", render: (r) => r.dropped_students, className: "text-red-500" },
];

export default function VPAARetention() {
  return (
    <VPAAReviewPage
      title="Retention Rates 📈"
      subtitle="Review retention data approved by each school's Dean."
      uri="/retention"
      columns={columns}
    />
  );
}