import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { Toaster } from "sonner";
const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Glowing Smiles Doctors | Book Doctor Appointments Online",
  description: "Find trusted doctors, dental specialists, and book appointments in seconds with Glowing Smiles Doctors.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div className="md:px-20">
          <Header/>
          {children}
          <Toaster/>
        </div>
        <Footer/>
        </body>
    </html>
  );
}
