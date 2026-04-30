export const handleWebhook = (payload: any) => {
  const { event, data } = payload;

  if (event === "payment.success") {
    return {
      status: "success",
      paymentId: data.id,
    };
  }

  if (event === "payment.failed") {
    return {
      status: "failed",
      paymentId: data.id,
    };
  }

  return null;
};