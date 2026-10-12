const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

function required(name, value) {
  if (!value) throw new Error(`EmailJS ${name} is not configured.`);
}

export async function sendOrderConfirmationEmail(order, form, cart) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  required("service ID", serviceId);
  required("template ID", templateId);
  required("public key", publicKey);

  const itemRows = (cart || []).map(item =>
    `${item.name} × ${item.quantity} — ₹${Number(item.price || 0).toLocaleString("en-IN")}`
  ).join("\n");

  const shippingAddress = [form.address, form.apartment, form.city, form.state, form.pincode]
    .filter(Boolean)
    .join(", ");

  const templateParams = {
    to_email: form.email,
    to_name: form.name,
    order_number: order?.orderNumber || order?._id || "Confirmed",
    order_status: order?.status || "placed",
    order_items: itemRows,
    subtotal: `₹${Number(order?.subtotal || 0).toLocaleString("en-IN")}`,
    shipping: `₹${Number(order?.shippingFee || 0).toLocaleString("en-IN")}`,
    total: `₹${Number(order?.total || 0).toLocaleString("en-IN")}`,
    shipping_address: shippingAddress,
    payment_method: "Cash on Delivery",
    store_name: "SP FASHION",
  };

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: publicKey, template_params: templateParams }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `EmailJS returned ${response.status}.`);
  }

  return true;
}
