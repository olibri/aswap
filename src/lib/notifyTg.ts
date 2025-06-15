export async function notifyTg(payload: {
  dealId: number;
  buyerWallet: string;
  sellerWallet: string;
  orderUrl: string;
  receiver: "Buyer" | "Seller";
}) {
  try {
    const body = {
        dealId:             payload.dealId,
        buyerWallet:        payload.buyerWallet,
        sellerWallet:       payload.sellerWallet,
        orderUrl:           payload.orderUrl,
        notificationReceiver: payload.receiver,  
        messageType:        "OrderCreated"
    };
    console.debug("[TG] notify", body);
    await fetch("/api/platform/call-tg-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.error("[TG] notify failed", e);
  }
}
