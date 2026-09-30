import DeanReviewPage from "../../components/DeanReviewPage";

const columns = [
  { label: "Faculty", render: (r) => r.faculty_name },
  { label: "Achievement", render: (r) => r.achievement_title },
  { label: "Type", render: (r) => r.type, className: "capitalize" },
  { label: "Date", render: (r) => r.date_awarded ?? "—" },
];

export default function DeanAchievements() {
  return (
    <DeanReviewPage
      title="Achievement Submissions 🏆"
      subtitle="Review and approve faculty achievement data."
      uri="/achievements"
      columns={columns}
      byProgram={false}
    />
  );
}