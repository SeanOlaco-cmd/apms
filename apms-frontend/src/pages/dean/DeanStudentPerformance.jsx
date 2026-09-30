import DeanReviewPage from "../../components/DeanReviewPage";

const columns = [
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Total", render: (r) => r.total_students },
  { label: "Passing", render: (r) => r.passing, className: "text-green-600" },
  { label: "Failing", render: (r) => r.failing, className: "text-red-500" },
  { label: "Passing Rate", render: (r) => `${r.passing_rate}%`, className: "font-semibold" },
  { label: "Avg GWA", render: (r) => r.average_gwa },
];

export default function DeanStudentPerformance() {
  return (
    <DeanReviewPage
      title="Student Performance Submissions 🎓"
      subtitle="Review and approve student performance data."
      uri="/student-performance"
      columns={columns}
    />
  );
}