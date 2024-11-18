"use client";

import { CacheProvider } from "@chakra-ui/next-js"; // Chakra UI の SSR サポート
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
