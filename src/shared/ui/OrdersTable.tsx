"use client";

const orders = [
  { id: "#123", user: "Ali", amount: "₹500", status: "Delivered" },
  { id: "#124", user: "Rahul", amount: "₹900", status: "Pending" },
];

export const OrdersTable = () => {
  return (
    <div className="glass p-5 rounded-xl mt-6">
      <h2 className="mb-4">Orders</h2>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-400">
            <th>ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-white/10">
              <td>{o.id}</td>
              <td>{o.user}</td>
              <td>{o.amount}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
