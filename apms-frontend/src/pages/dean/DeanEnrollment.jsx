import DeanReviewPage from "../../components/DeanReviewPage";

const columns = [
  { label: "Period", render: (r) => `${r.academic_period?.school_year} - ${r.academic_period?.semester}` },
  { label: "Total", render: (r) => r.total_enrolled, className: "font-semibold" },
  { label: "Male", render: (r) => r.male_count },
  { label: "Female", render: (r) => r.female_count },
];

export default function DeanEnrollment() {
  return (
    <DeanReviewPage
      title="Enrollment Submissions 📋"
      subtitle="Review and approve enrollment data from your department heads."
      uri="/enrollment"
      columns={columns}
    />
  );
}