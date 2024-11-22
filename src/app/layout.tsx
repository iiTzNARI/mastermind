import type { Metadata } from "next";
import { Container, Box } from "@chakra-ui/react";
import { Provider } from "@/components/ui/provider";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Provider>
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
        </Provider>
      </body>
    </html>
  );
}
