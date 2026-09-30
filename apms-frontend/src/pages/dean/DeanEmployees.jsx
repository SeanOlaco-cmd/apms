import DeanReviewPage from "../../components/DeanReviewPage";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const columns = [
  { label: "Emp. No.", render: (r) => r.employee_no ?? "—" },
  { label: "Name", render: (r) => r.employee_name },
  { label: "Position", render: (r) => r.position ?? "—" },
  { label: "Type", render: (r) => r.employment_type?.replace("_", " "), className: "capitalize" },
  { label: "Education", render: (r) => r.highest_education ?? "—" },
  { label: "Date Hired", render: (r) => fmtDate(r.date_hired) },
];

export default function DeanEmployees() {
  return (
    <DeanReviewPage
      title="Faculty & Employees 🧑‍💼"
      subtitle="Search and review the faculty and employee list for your school, and approve entries from your department heads."
      uri="/employees"
      columns={columns}
      filter={{
        label: "Type",
        field: "employment_type",
        options: [
          { value: "full_time", label: "Full Time" },
          { value: "part_time", label: "Part Time" },
        ],
      }}
    />
  );
}