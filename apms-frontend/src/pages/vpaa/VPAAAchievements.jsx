import VPAAReviewPage from "../../components/VPAAReviewPage";

const columns = [
  { label: "Faculty", render: (r) => r.faculty_name },
  { label: "Achievement", render: (r) => r.achievement_title },
  { label: "Type", render: (r) => r.type, className: "capitalize" },
  { label: "Date", render: (r) => r.date_awarded ?? "—" },
];

export default function VPAAAchievements() {
  return (
    <VPAAReviewPage
      title="Faculty Achievements 🏆"
      subtitle="Review faculty achievements approved by each school's Dean."
      uri="/achievements"
      columns={columns}
    />
  );
}