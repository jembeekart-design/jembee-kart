import ProductCard from "@/components/ui/ProductCard";

export default function Section({ title, products, blue = false }: any) {
  return (
    <div className={`m-2 p-3 rounded-xl ${blue ? "bg-blue-500" : "bg-red-500"}`}>
      
      <div className="flex justify-between items-center text-white mb-2">
        <h2 className="font-bold">{title}</h2>
        <button>→</button>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl">
        {products.map((item: any, i: number) => (
          <ProductCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
