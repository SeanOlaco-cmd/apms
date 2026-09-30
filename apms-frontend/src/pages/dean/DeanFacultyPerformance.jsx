import DeanReviewPage from "../../components/DeanReviewPage";

const columns = [
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Total Faculty", render: (r) => r.total_faculty },
  { label: "Full Time", render: (r) => r.full_time },
  { label: "Part Time", render: (r) => r.part_time },
  { label: "Avg Score", render: (r) => r.average_evaluation_score, className: "text-green-600 font-semibold" },
];

export default function DeanFacultyPerformance() {
  return (
    <DeanReviewPage
      title="Faculty Performance Submissions 👨‍🏫"
      subtitle="Review and approve faculty performance data from your department heads."
      uri="/faculty-performance"
      columns={columns}
      byProgram={false}
    />
  );
}