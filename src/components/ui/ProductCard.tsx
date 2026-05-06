export default function ProductCard({ item }: any) {
  return (
    <div>
      <div className="bg-gray-100 rounded-xl p-2">
        <div className="h-32 bg-gray-300 rounded-xl" />
      </div>
      <p className="text-sm mt-1">{item.title}</p>
      <p className="font-bold">{item.price}</p>
    </div>
  );
}
