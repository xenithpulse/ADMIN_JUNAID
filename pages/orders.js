import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort latest first
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
  
    fetchOrders();
  }, []);
  

  const fetchProductDetails = async (productId) => {
    if (!productDetails[productId]) {
      try {
        const res = await axios.get(`/api/products/${productId}`);
        setProductDetails(prev => ({ ...prev, [productId]: res.data }));
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    } 
  };

  const handlePaymentStatusChange = async (orderId) => {
    try {
      const response = await axios.put(`/api/orders`, { id: orderId, paid: true });
      console.log(`Updated payment status for order ${orderId}:`, response.data); // Log the response after update
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, paid: true } : order
        )
      );
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleCheckboxChange = async (orderId) => {
    try {
      const response = await axios.put(`/api/orders`, { id: orderId, sendEmailSignal: true });
      console.log(`Updated email status for order ${orderId}:`, response.data);
  
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, sendEmailSignal: true } : order
        )
      );
    } catch (error) {
      console.error("Error updating email status:", error);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-center text-black">Orders</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden">
          <thead className="bg-black text-white">
            <tr>
              <th className="py-3 px-4 text-center">Products</th>
              <th className="py-3 px-4 text-center">Date</th>
              <th className="py-3 px-4 text-center">Recipient</th>
              <th className="py-3 px-4 text-center">Properties</th>
              <th className="py-3 px-4 text-center">Payment Method</th>
              <th className="py-3 px-4 text-center">Payment Status</th>
              <th className="py-3 px-4 text-center">Mail Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                <tr key={order._id} className={`border-black hover:bg-gray-100 ${order.paid ? 'bg-green-200' : ''}`}>
                  <td className="py-4 px-4">
                    {order.line_items.map(item => (
                      <div key={item.productId} className="mb-2 flex items-center">
                        <img 
                          src={item.image} 
                          alt={`Product image for ${item.productId}`} 
                          className="w-16 h-16 object-cover mr-2 rounded" 
                        />
                        <div>
                        <strong style={{ 
                            flex: "1 1 auto", 
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis" 
                          }}>
                            {item.title.split(" ").slice(0, 4).join(" ") + (item.title.split(" ").length > 4 ? "..." : "")}
                          </strong> 
                          <br />

                          <strong>Quantity:</strong> {item._doc?.quantity} <br />
                          <strong>Starting Price:</strong> PKR {item.price} <br />
                        </div>
                      </div>
                    ))}
                  </td>
                  <td className="py-4 px-4 text-center ">{(new Date(order.createdAt)).toLocaleString()}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-semibold">{order.name}</div>
                    <div>{order.email}</div>
                    <div>{order.city}, {order.phone}</div>
                    <div>{order.country}</div>
                    <div>{order.streetAddress}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {order.line_items.map((item, index) => {
                      const productId = item.productId;
                      if (!productDetails[productId]) {
                        fetchProductDetails(productId); 
                      }

                      const selectedOptions = item._doc?.selectedOptions || {};
                      let price = null;

                      if (selectedOptions.Dimensions) {
                        const priceMatch = selectedOptions.Dimensions.match(/\(PKR\s([\d,.]+)\)/);
                        if (priceMatch) {
                          price = priceMatch[1].replace(",", "");
                        }
                      }

                      return (
                        <div key={index}>
                          <div>
                            {selectedOptions.Dimensions || "N/A"}<br />
                            {selectedOptions.Colors || "N/A"}<br />
                          </div>
                        </div>
                      );
                    })}
                  </td>
                  <td className="py-4 px-4 text-center">{order.paymentMethod || "N/A"}</td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={order.paid}
                      onChange={() => handlePaymentStatusChange(order._id)}
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={order.sendEmailSignal}
                      onChange={() => handleCheckboxChange(order._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
