import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();

  useEffect(() => {
    const sendEmails = async () => {
      if (session) {
        try {
          console.log("User is logged in. Sending confirmation emails...");
          const response = await fetch("/api/sendEmail", {
            method: "POST",
          });
          if (response.ok) {
            console.log("Confirmation emails sent.");
          } else {
            console.error("Failed to send emails:", response.statusText);
          }
        } catch (error) {
          console.error("Error sending confirmation emails:", error);
        }
      }
    };

    sendEmails(); // Invoke the function on component mount
  }, [session]); // Dependency array includes `session` to run when it changes

  return (
    <Layout>
      <div className="text-black bg-white w-screen h-screen flex items-start justify-start relative">
        <div className="absolute top-0 left-[25%] mt-4">
          <h2 className="text-3xl text-black font-bold mb-2">
            WELCOME TO THE SUDO PANEL
          </h2>
          <div className="flex bg-black-700 gap-1 text-black rounded-lg overflow-hidden animate-fade-in">
            <img src={session?.user?.image} alt="" className="w-10 h-10" />
            <span className="px-2">{session?.user?.name}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
