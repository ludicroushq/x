import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider";
import "./global.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RootProvider theme={{ forcedTheme: "light" }}>{children}</RootProvider>
      </body>
    </html>
  );
}
