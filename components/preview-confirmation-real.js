// import React from "react";
// import Layout from "@/components/Layout";
// import { Order } from "@/models/Order";
// import { Product } from "@/models/Product";
// import mongoose from "mongoose";
// import Image from "next/image";

// const connectDB = async () => {
//   if (mongoose.connection.readyState === 0) {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//   }
// };

// // This function fetches the order and product data
// export async function getServerSideProps() {
//   await connectDB();

//   const order = await Order.findOne({ sendEmailSignal: true }).lean();
//   if (!order) {
//     return { props: { order: null, productDetails: [] } };
//   }

//   const productDetails = await Promise.all(
//     order.line_items.map(async (item) => {
//       const product = await Product.findById(item.productId);
//       const selectedOptions = item.selectedOptions || {};
//       let price = product?.price || 0;

//       if (selectedOptions.Dimensions) {
//         const priceMatch = selectedOptions.Dimensions.match(/\(PKR\s([\d,.]+)\)/);
//         if (priceMatch) {
//           price = priceMatch[1].replace(",", "");
//           selectedOptions.Dimensions = selectedOptions.Dimensions.replace(/\s*\(PKR\s[\d,.]+\)/, "").trim();
//         }
//       }

//       return {
//         title: product?.title || "Unknown Product",
//         price: parseFloat(price),
//         quantity: item.quantity,
//         selectedOptions: selectedOptions,
//         image: product?.images[0] || "",
//       };
//     })
//   );

//   return { props: { order: JSON.parse(JSON.stringify(order)), productDetails } };
// }

// // The preview component
// const PreviewConfirmationReal = ({ order, productDetails }) => {
//   if (!order) {
//     return <p>No order found to preview.</p>;
//   }

//   // Calculate totals
//   const itemsTotal = productDetails.reduce((total, product) => total + product.price * product.quantity, 0);
//   const shopDiscount = itemsTotal >= 5000 ? itemsTotal * 0.1 : 0; // Assuming a 10% discount if the total is >= 5000
//   const subtotal = itemsTotal - shopDiscount;
//   const deliveryFee = itemsTotal >= 3000 ? 0 : 99; // Free delivery for orders >= 3000
//   const totalPayment = subtotal + deliveryFee;

//   return (
//     <Layout>
        

//       <div
//         style={{
//           maxWidth: "600px",
//           margin: "50px auto",
//           padding: "20px",
//           border: "1px solid #ddd",
//           borderRadius: "8px",
//           backgroundColor: "#f9f9f9",
//           boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//               <div>
//       <Image
//            src="/LogoMail.png"
//            width={600} // Set appropriate width
//            height={80} // Set appropriate height
//         /> 
//       </div>  
          
//         <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize:"1.6rem", marginTop: "20px" }}>Order Summary</h1>

//         <div style={{ borderTop: "1px solid #ddd", margin: "20px 0" }}></div>

//         <p style={{ textAlign: "center", marginTop:"6px" }}>Thank you, <strong>{order.name}</strong>, for your purchase!</p>
//         <p style={{ textAlign: "center", marginTop:"6px" }}>Your order has been placed successfully and we will let you know once your package is on its way.</p>

//         <div style={{ borderTop: "1px solid #ddd", margin: "20px 0" }}></div>

//         <ul style={{ listStyle: "none", padding: 0 }}>
//           {productDetails.map((product, index) => (
//             <li
//               key={index}
//               style={{
//                 display: "flex",
//                 alignItems: "flex-start",
//                 margin: "10px 0",
//                 borderBottom: "1px solid #ddd",
//                 paddingBottom: "10px",
//               }}
//             >
//               <img
//                 src={product.image}
//                 alt={product.title}
//                 style={{
//                   width: "120px",
//                   height: "120px",
//                   marginRight: "10px",
//                   borderRadius: "5px",
//                   objectFit: "cover",
//                 }}
//               />
              
//               <div style={{ flex: 1 }}>
//                 <strong
//                   style={{
//                     display: "block",
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                     maxWidth: "400px",
//                   }}
//                 >
//                   {product.title}
//                 </strong>
//                 <p><strong>Quantity: </strong>{product.quantity}</p>
//                 <p><strong>Price: </strong> PKR {product.price.toFixed(2)}</p>
//                 <div>
//                   <strong>Dimensions: </strong>{product.selectedOptions.Dimensions || "N/A"} <br />
//                   <strong>Color: </strong> {product.selectedOptions.Colors || "N/A"}
//                 </div>
//               </div>
//             </li>
//           ))}
//         </ul>


//         {/* New Order Details Section */}
//         <div style={{ margin: "20px 0" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
//             <span>Item(s) total:</span>
//             <span>PKR {itemsTotal.toFixed(2)}</span>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
//             <span>Shop discount:</span>
//             {shopDiscount > 0 ? (
//               <span>-PKR {shopDiscount.toFixed(2)}</span>
//             ) : (
//               <span>PKR 0.00</span>
//             )}
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
//             <span>Subtotal:</span>
//             <span>PKR {subtotal.toFixed(2)}</span>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
//             <span>Delivery:</span>
//             <span>
//               {deliveryFee === 0 ? (
//                 <>FREE <span>(Pakistan)</span></>
//               ) : (
//                 <>PKR {deliveryFee.toFixed(2)} <span>(Pakistan)</span></>
//               )}
//             </span>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
//             <strong>Total:</strong>
//             <strong>PKR {totalPayment.toFixed(2)}</strong>
//           </div>
//         </div>

//         <div style={{ borderBottom: "1px solid #ddd", margin: "20px 0" }}></div>

//         <h1 style={{ textAlign: "center" }}>Delivery Details</h1>

//         {/* Shipping Address */}
//         <div style={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
//         <p style={{ fontWeight: "bold", marginRight: "10px" }}>Address:</p>
//         <p style={{ flex: "1 1 auto", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//             {order.streetAddress}, {order.city}, {order.country}
//         </p>
//         </div>

//         {/* Phone */}
//         <div style={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
//         <p style={{ fontWeight: "bold", marginRight: "10px" }}>Phone:</p>
//         <p>{order.phone}</p>
//         </div>

//         {/* Email */}
//         <div style={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
//         <p style={{ fontWeight: "bold", marginRight: "10px" }}>Email:</p>
//         <p>{order.email}</p>
//         </div>

//         {/* Payment Method */}
//         <div style={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
//         <p style={{ fontWeight: "bold", marginRight: "10px" }}>Payment Method:</p>
//         <p>{order.paymentMethod}</p>
//         </div>


//         <div style={{ borderBottom: "1px solid #ddd", margin: "20px 0" }}></div>

//         <p style={{textAlign:"center"}}>This is an automatically generated e-mail from our subscription list.</p>
//         <p style={{textAlign:"center"}}>Please do not reply to this e-mail.</p>

//       </div>
//     </Layout>
//   );
// };

// export default PreviewConfirmationReal;
