import DeanReviewPage from "../../components/DeanReviewPage";

const columns = [
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Exam Name", render: (r) => r.exam_name ?? "—" },
  { label: "Examinees", render: (r) => r.total_examinees },
  { label: "Passers", render: (r) => r.total_passers, className: "text-green-600" },
  { label: "Passing Rate", render: (r) => `${r.passing_rate}%`, className: "font-semibold" },
];

export default function DeanBoardExam() {
  return (
    <DeanReviewPage
      title="Board Exam Submissions 📝"
      subtitle="Review and approve board exam results."
      uri="/board-exam-results"
      columns={columns}
    />
  );
}