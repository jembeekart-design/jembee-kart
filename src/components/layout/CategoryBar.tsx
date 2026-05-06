export default function CategoryBar() {
  const items = ["For You", "Fashion", "Mobiles", "Beauty", "Electronics"];

  return (
    <div className="flex gap-4 overflow-x-auto p-2 bg-white">
      {items.map((item, i) => (
        <span
          key={i}
          className={`whitespace-nowrap px-3 py-1 rounded-full ${
            i === 0 ? "bg-blue-100 text-blue-600" : ""
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
