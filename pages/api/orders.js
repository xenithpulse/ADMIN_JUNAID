import { Order } from "@/models/Order"; // Ensure to import the Order model
import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  await mongooseConnect(); // Connect to the database
  await isAdminRequest(req, res); // Check if the request is from an admin

  const { method } = req;

  // Handle GET request to fetch orders
  if (method === "GET") {
    try {
      const orders = await Order.find(); // Fetch all orders

      // Extract product IDs from line items
      const productIds = orders.flatMap(order =>
        order.line_items.map(item => item.productId)
      );

      // Fetch all products that match the productIds from line_items
      const productsInfos = await Product.find({ _id: { $in: productIds } });

      // Enrich orders with product information
      const enrichedOrders = orders.map(order => {
        const enrichedItems = order.line_items.map(item => {
          const productInfo = productsInfos.find(p => p._id.equals(item.productId));
          
          return productInfo
            ? {
                ...item,
                title: productInfo.title,
                price: productInfo.price,
                image: productInfo.images[0] || null // Add image to the response
              }
            : item; // If product not found, return item as is
        });
        
        return {
          ...order._doc, // Keep other order fields
          line_items: enrichedItems,
        };
      });

      res.status(200).json(enrichedOrders); // Send the enriched orders in response
    } catch (error) {
      console.error("Error fetching orders:", error); // Log the error
      res.status(500).json({ error: "Error fetching orders", details: error.message }); // Send error response
    }
  } 

  else if (method === "PUT") {
    const { id, paid, sendEmailSignal } = req.body;
    
    if (!id || (typeof paid !== 'boolean' && typeof sendEmailSignal !== 'boolean')) {
      return res.status(400).json({ error: "Invalid request body" });
    }
  
    try {
      const updateFields = {};
      if (typeof paid === 'boolean') updateFields.paid = paid;
      if (typeof sendEmailSignal === 'boolean') updateFields.sendEmailSignal = sendEmailSignal;
  
      console.log("Updating with fields:", updateFields); // Add this to verify payload
  
      const order = await Order.findByIdAndUpdate(id, updateFields, { new: true });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      res.status(200).json({ message: "Order updated successfully", order });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Error updating order", details: error.message });
    }
  }
}  