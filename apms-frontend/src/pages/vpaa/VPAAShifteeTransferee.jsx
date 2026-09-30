import VPAAReviewPage from "../../components/VPAAReviewPage";

const columns = [
  { label: "Program", render: (r) => r.program?.code },
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Shiftees", render: (r) => r.total_shiftees },
  { label: "Transferees", render: (r) => r.total_transferees },
  { label: "Dropouts", render: (r) => r.total_dropouts, className: "text-red-500" },
];

export default function VPAAShifteeTransferee() {
  return (
    <VPAAReviewPage
      title="Shiftee & Transferee Data 🔄"
      subtitle="Review shiftee/transferee data approved by each school's Dean."
      uri="/shiftee-transferee"
      columns={columns}
    />
  );
}