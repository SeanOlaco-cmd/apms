import VPAAReviewPage from "../../components/VPAAReviewPage";

const columns = [
  { label: "Program", render: (r) => r.program?.code },
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Total", render: (r) => r.total_enrolled, className: "font-semibold" },
  { label: "Male", render: (r) => r.male_count },
  { label: "Female", render: (r) => r.female_count },
];

export default function VPAAEnrollment() {
  return (
    <VPAAReviewPage
      title="Enrollment Data 📋"
      subtitle="Review enrollment data approved by each school's Dean."
      uri="/enrollment"
      columns={columns}
    />
  );
}