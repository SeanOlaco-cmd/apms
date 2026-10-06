import DeanReviewPage from "../../components/DeanReviewPage";
import StudentCasesSection from "../../components/StudentCasesSection";

const columns = [
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Total Shiftees", render: (r) => r.total_shiftees },
  { label: "Total Transferees", render: (r) => r.total_transferees },
  { label: "Dropouts", render: (r) => r.total_dropouts, className: "text-red-500" },
];

export default function DeanShifteeTransferee() {
  return (
    <div className="flex flex-col gap-6">
      <StudentCasesSection caseTypes={["shift_course", "transfer_school"]} dhMode={false} />
      <DeanReviewPage
        title="Shiftee & Transferee Submissions 🔄"
        subtitle="Review and approve shiftee/transferee data."
        uri="/shiftee-transferee"
        columns={columns}
      />
    </div>
  );
}