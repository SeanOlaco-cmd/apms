import DeanReviewPage from "../../components/DeanReviewPage";

const columns = [
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Total Shiftees", render: (r) => r.total_shiftees },
  { label: "Total Transferees", render: (r) => r.total_transferees },
  { label: "Dropouts", render: (r) => r.total_dropouts, className: "text-red-500" },
];

export default function DeanShifteeTransferee() {
  return (
    <DeanReviewPage
      title="Shiftee & Transferee Submissions 🔄"
      subtitle="Review and approve shiftee/transferee data."
      uri="/shiftee-transferee"
      columns={columns}
    />
  );
}