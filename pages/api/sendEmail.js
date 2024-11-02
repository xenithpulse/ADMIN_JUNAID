// pages/api/send-emails.js
import mongoose from "mongoose";
import { sendConfirmationEmails } from "@/Email/Sender"; // Adjust the import as necessary

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  };
  
  export default async function handler(req, res) {
    if (req.method === "POST") {
      try {
        await connectDB(); // Ensure the database is connected
        await sendConfirmationEmails(); // Call your function to send emails
        res.status(200).json({ message: "Emails sent successfully." });
      } catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).json({ error: "Failed to send emails." });
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }