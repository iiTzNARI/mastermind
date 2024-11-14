// src/app/layout.tsx
import type { Metadata } from "next";
import ClientProvider from "./ClientProvider";
import localFont from "next/font/local";
import "./globals.css";
import { Container, Box } from "@chakra-ui/react";

// シンプルなフォント設定
const geistSans = localFont({
  src: "/fonts/GeistVF.woff",
  display: "swap",
});

const geistMono = localFont({
  src: "/fonts/GeistMonoVF.woff",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mastermind Game",
  description: "A Next.js Mastermind game application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientProvider>
          <Box
            bg="gray.800"
            display="flex"
            justifyContent="center"
            alignItems="center"
            minH="100vh"
            p={4}
          >
            <Container
              maxW="container.md"
              centerContent
              bg="gray.800"
              color="gray.50"
              p={6}
              borderRadius="md"
              border="1px solid"
              borderColor="gray.600"
            >
              {children}
            </Container>
          </Box>
        </ClientProvider>
      </body>
    </html>
  );
}
