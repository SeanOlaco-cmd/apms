import VPAAReviewPage from "../../components/VPAAReviewPage";

const columns = [
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Total Faculty", render: (r) => r.total_faculty },
  { label: "Full Time", render: (r) => r.full_time },
  { label: "Part Time", render: (r) => r.part_time },
  { label: "Avg Score", render: (r) => r.average_evaluation_score, className: "text-green-600 font-semibold" },
];

export default function VPAAFacultyPerformance() {
  return (
    <VPAAReviewPage
      title="Faculty Performance 👨‍🏫"
      subtitle="Review faculty performance data approved by each school's Dean."
      uri="/faculty-performance"
      columns={columns}
    />
  );
}