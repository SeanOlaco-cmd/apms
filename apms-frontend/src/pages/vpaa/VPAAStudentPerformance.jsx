import VPAAReviewPage from "../../components/VPAAReviewPage";

const columns = [
  { label: "Program", render: (r) => r.program?.code },
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Total", render: (r) => r.total_students },
  { label: "Passing", render: (r) => r.passing, className: "text-green-600" },
  { label: "Failing", render: (r) => r.failing, className: "text-red-500" },
  { label: "Passing Rate", render: (r) => `${r.passing_rate}%`, className: "font-semibold" },
  { label: "Avg GWA", render: (r) => r.average_gwa },
];

export default function VPAAStudentPerformance() {
  return (
    <VPAAReviewPage
      title="Student Performance 🎓"
      subtitle="Review student performance data approved by each school's Dean."
      uri="/student-performance"
      columns={columns}
    />
  );
}