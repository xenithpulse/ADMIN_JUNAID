import nodemailer from "nodemailer";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendConfirmationEmails() {
  try {
    const orders = await Order.find({ sendEmailSignal: true, emailSent: false });

    if (orders.length === 0) {
      console.log("No orders found that require email confirmation.");
      return;
    }

    for (const order of orders) {
      console.log(`Processing order ID: ${order._id}`);

      const productDetails = await Promise.all(
        order.line_items.map(async (item) => {
          const product = await Product.findById(item.productId);
          return {
            title: product?.title || "Unknown Product",
            price: product?.price || 0,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions,
            image: product?.images[0] || "",
          };
        })
      );

      const itemsTotal = productDetails.reduce(
        (total, product) => total + (product.price || 0) * (product.quantity || 1),
        0
      );
      
      const shopDiscount = itemsTotal >= 5000 ? itemsTotal * 0.1 : 0;
      const subtotal = itemsTotal - shopDiscount;
      const deliveryFee = itemsTotal >= 3000 ? 0 : 99;
      const totalPayment = subtotal + deliveryFee;
      

      const message = `
      <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; font-family: Arial, sans-serif; color: #333;">
        
        <div style="text-align: center;">
          <img src="https://yourdomain.com/LogoMail.png" alt="Logo" style="width: 100%; height: auto; max-width: 180px; margin-bottom: 20px;" />
        </div>
        
        <h1 style="text-align: center; font-size: 1.4rem; color: #444;">Order Confirmation</h1>
        <p style="text-align: center; font-size: 1rem;">Thank you, <strong>${order.name}</strong>, for your purchase!</p>
        <p style="text-align: center; margin-bottom: 20px;">Your order has been placed successfully. We will notify you once your package is on its way.</p>

        <div style="margin-bottom: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
          <h2 style="font-size: 1.2rem; margin-bottom: 10px;">Order Summary</h2>
          <ul style="list-style: none; padding: 0;">
            ${productDetails.map((product) => `
              <li style="display: flex; gap: 10px; border-bottom: 1px solid #ddd; padding: 15px 0;">
                <img src="${product.image}" alt="${product.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;" />
                <div style="flex-grow: 1;">
                  <p style="margin: 0; font-weight: bold;">${product.title}</p>
                  <p style="margin: 4px 0;"><strong>Quantity:</strong> ${product.quantity}</p>
                  <p style="margin: 4px 0;"><strong>Price:</strong> PKR ${product.price.toFixed(2)}</p>
                  <p style="margin: 4px 0;"><strong>Dimensions:</strong> ${product.selectedOptions.Dimensions || "N/A"}</p>
                  <p style="margin: 4px 0;"><strong>Color:</strong> ${product.selectedOptions.Colors || "N/A"}</p>
                </div>
              </li>`).join("")}
          </ul>
        </div>

  <div style="margin-bottom: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
    <h2 style="font-size: 1.2rem; margin-bottom: 10px;">Payment Summary</h2>
    <p><strong>Item(s) Total:</strong> PKR ${itemsTotal.toFixed(2)}</p>
    <p><strong>Shop Discount:</strong> ${shopDiscount > 0 ? `-PKR ${shopDiscount.toFixed(2)}` : "PKR 0.00"}</p>
    <p><strong>Subtotal:</strong> PKR ${subtotal.toFixed(2)}</p>
    <p><strong>Delivery:</strong> ${deliveryFee === 0 ? "FREE" : `PKR ${deliveryFee.toFixed(2)}`}</p>
    <h3 style="margin-top: 10px; font-size: 1.2rem;"><strong>Total Payment:</strong> PKR ${totalPayment.toFixed(2)}</h3>
  </div>

        <div style="margin-bottom: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
          <h2 style="font-size: 1.2rem; margin-bottom: 10px;">Delivery Details</h2>
          <p><strong>Address:</strong> ${order.streetAddress}, ${order.city}, ${order.country}</p>
          <p><strong>Phone:</strong> ${order.phone}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>

        <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>This is an automatically generated email. Please do not reply.</p>
        </div>
      </div>`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.email,
        subject: "Your Order Confirmation",
        html: message,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Confirmation email sent for order ID: ${order._id}`);
      await Order.findByIdAndUpdate(order._id, { emailSent: true });
    }
  } catch (error) {
    console.error("Error sending confirmation emails:", error);
  }
}
