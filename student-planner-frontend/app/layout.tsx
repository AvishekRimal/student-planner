import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // The global stylesheet

// Provider components
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { AuthInitializer } from "@/components/providers/AuthInitializer"; // <-- Import the new initializer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Planner",
  description: "All-in-one planner for students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* The ReduxProvider must be on the outside so AuthInitializer can dispatch actions */}
        <ReduxProvider>
          {/* 
            The AuthInitializer runs on the client to check the cookie and
            "rehydrate" the Redux store with the user's session.
          */}
          <AuthInitializer>
            {/* The ThemeProvider handles light/dark mode */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {/* 
                This is where the rest of your application, including your other layouts
                and pages ((auth) and (main)), will be rendered.
              */}
              {children}
            </ThemeProvider>
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}