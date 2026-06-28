export default function Topbar({ title }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#7b1113] flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.charAt(0)}
        </div>
      </div>
    </div>
  );
}