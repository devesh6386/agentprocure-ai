"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

export default function CheckoutButton({ requestId, price, role }) {
  const [paymentStatus, setPaymentStatus] = useState(null);

  if (role !== "finance_manager") {
    return (
      <div className="w-full py-3 bg-slate-800 text-slate-400 text-sm font-medium rounded-lg text-center border border-slate-700 cursor-not-allowed">
        🔒 Finance Manager Required
      </div>
    );
  }

  if (paymentStatus === "COMPLETED") {
    return (
      <div className="w-full py-3 bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-lg text-center border border-emerald-500/50">
        ✅ Payment Captured Successfully
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb" }}>
      <PayPalButtons
        style={{ layout: "horizontal", height: 45, color: "gold" }}
        createOrder={async () => {
          const res = await fetch("http://127.0.0.1:8000/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-role": role },
            body: JSON.stringify({ request_id: requestId, amount: price }),
          });
          const data = await res.json();
          return data.order_id;
        }}
        onApprove={async (data) => {
          const res = await fetch("http://127.0.0.1:8000/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-role": role },
            body: JSON.stringify({ order_id: data.orderID }),
          });
          if (res.ok) {
            const captureData = await res.json();
            if (captureData.status === "COMPLETED") {
              setPaymentStatus("COMPLETED");
            }
          }
        }}
      />
    </PayPalScriptProvider>
  );
}