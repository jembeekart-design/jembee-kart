"use client";

export const TrackOrderScreen = ({ order }: any) => {
  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Track Order</h2>

      <p>Status: {order.status}</p>
    </div>
  );
};