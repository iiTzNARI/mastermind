"use client";

import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bg="gray.800"
      color="gray.50"
      p={4}
    >
      <VStack spacing={6} textAlign="center">
        <Heading size="2xl">404 - ページが見つかりません</Heading>
        <Text fontSize="lg" color="gray.300">
          お探しのページは存在しないか、移動された可能性があります。
        </Text>
        <Button colorScheme="blue" size="lg" onClick={() => router.push("/")}>
          ホームに戻る
        </Button>
      </VStack>
    </Box>
  );
}
