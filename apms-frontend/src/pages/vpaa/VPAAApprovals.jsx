import ApprovalList from "../../components/ApprovalList";

export default function VPAAApprovals() {
  return (
    <ApprovalList viewer="vpaa" basePath="/vpaa/approvals" title="Approval of Submitted Reports"
      subtitle="Give final approval to the enrollment and retention reports the Deans have approved." />
  );
}