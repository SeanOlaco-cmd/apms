import ApprovalList from "../../components/ApprovalList";

export default function DeanApprovals() {
  return (
    <ApprovalList viewer="dean" basePath="/dean/approvals" title="Approval of Submitted Reports"
      subtitle="Review enrollment and retention reports from the department heads, then approve or reject." />
  );
}