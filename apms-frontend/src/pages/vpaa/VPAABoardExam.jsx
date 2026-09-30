import VPAAReviewPage from "../../components/VPAAReviewPage";

const columns = [
  { label: "Program", render: (r) => r.program?.code },
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Exam Name", render: (r) => r.exam_name ?? "—" },
  { label: "Examinees", render: (r) => r.total_examinees },
  { label: "Passers", render: (r) => r.total_passers, className: "text-green-600" },
  { label: "Passing Rate", render: (r) => `${r.passing_rate}%`, className: "font-semibold" },
];

export default function VPAABoardExam() {
  return (
    <VPAAReviewPage
      title="Board Exam Results 📝"
      subtitle="Review board exam results approved by each school's Dean."
      uri="/board-exam-results"
      columns={columns}
    />
  );
}