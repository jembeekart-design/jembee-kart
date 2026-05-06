export default function Home() {

  const deals = [
    {
      img: "https://rukminim2.flixcart.com/image/300/300/xif0q/headphone/q/f/9/-original-imagz5f2w6h9zzgh.jpeg",
      title: "True Wireless",
      price: "Min. 50% Off",
    },
    {
      img: "https://rukminim2.flixcart.com/image/300/300/xif0q/smartwatch/x/s/l/-original-imagxp8tfb8zqzpb.jpeg",
      title: "Smart Watches",
      price: "Min. 40% Off",
    },
    {
      img: "https://rukminim2.flixcart.com/image/300/300/xif0q/trimmer/k/3/z/-original-imagzq8hzvphh8jt.jpeg",
      title: "Trimmers",
      price: "Min. 50% Off",
    },
    {
      img: "https://rukminim2.flixcart.com/image/300/300/xif0q/mixer-grinder-juicer/j/h/o/-original-imagk6kz7cz5f3ny.jpeg",
      title: "Mixer Grinder",
      price: "Min. 50% Off",
    },
  ];

  return (
    <main className="bg-[#f1f3f6] min-h-screen pb-20">

      {/* 🔵 HEADER */}
      <div className="bg-blue-600 p-3 sticky top-0 z-50">
        <input
          placeholder="Search for Products"
          className="w-full rounded-full px-4 py-2 outline-none"
        />
      </div>

      {/* 🧭 CATEGORY BAR */}
      <div className="flex gap-4 overflow-x-auto bg-white p-3 text-sm font-medium">
        {["For You", "Fashion", "Mobiles", "Beauty", "Electronics"].map((c) => (
          <span key={c} className="whitespace-nowrap">
            {c}
          </span>
        ))}
      </div>

      {/* 🎯 BANNER */}
      <div className="p-3">
        <img
          src="https://rukminim2.flixcart.com/fk-p-flap/844/140/image/2c1f4f9f5c2a6e3c.jpg"
          className="rounded-lg w-full"
        />
      </div>

      {/* 🔥 DEAL SECTION */}
      <div className="bg-white mx-3 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg">
            Best Gadgets & Appliances
          </h2>
          <button className="bg-black text-white px-3 py-1 rounded-full">
            →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {deals.map((item, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-2">
              <img src={item.img} className="rounded-lg mb-2" />
              <p className="text-sm">{item.title}</p>
              <p className="font-semibold text-sm">{item.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🧴 BEAUTY SECTION */}
      <div className="bg-white mx-3 rounded-lg p-3 mb-4">
        <h2 className="font-semibold text-lg mb-3">
          Hair & Skincare Essentials
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {deals.map((item, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-2">
              <img src={item.img} className="rounded-lg mb-2" />
              <p className="text-sm">{item.title}</p>
              <p className="font-semibold text-sm">Min. 50% Off</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🛍 PRODUCTS */}
      <div className="px-3">
        <h2 className="font-semibold text-lg mb-3">
          More products for you
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {deals.map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
              <img src={item.img} className="rounded-lg mb-2" />
              <p className="text-sm truncate">
                Product name example long text
              </p>
              <p className="font-bold">₹999</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔻 BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 text-xs">
        <div className="flex flex-col items-center text-blue-600">
          🏠 Home
        </div>
        <div className="flex flex-col items-center">
          📂 Categories
        </div>
        <div className="flex flex-col items-center">
          👤 Account
        </div>
        <div className="flex flex-col items-center">
          🛒 Cart
        </div>
      </div>

    </main>
  );
}
