import AccountMenu from "./AccountMenu";

export default function Topbar({ title }) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-3">
        <AccountMenu />
      </div>
    </div>
  );
}