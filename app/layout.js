import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Expense Handler",
  description: "Expense App",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          {/*Header */}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors/>

          {/* footer */}
          <footer className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 py-4">
            <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center">
              {/* <p className="flex items-center gap-1.5 text-sm text-slate-500">
               Made By
                <span className="font-semibold text-slate-700">
                  Raja Yadav
                </span>
              </p> */}
              <p className="text-xs text-slate-400">
            Made By   <span className="font-semibold text-slate-700">
                  Raja Yadav
                </span> @ AI Expense Handler. All rights
                reserved.
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
