export default function NavItem({ label, active = false }: any) {
  return (
    <div className={`text-center ${active ? "text-blue-500" : "text-gray-500"}`}>
      <div>🏠</div>
      <p className="text-xs">{label}</p>
    </div>
  );
}
