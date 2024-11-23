"use client";

import {
  VStack,
  Text,
  Spinner,
  Input,
  Stack,
  Box,
  InputAddon,
} from "@chakra-ui/react";
import CopyButton from "@/components/CopyButton";
import ExitButton from "@/components/ExitButton";

interface WaitingViewMultiProps {
  roomId: string | null;
  playerId: string;
  onExit: () => void;
}

export default function WaitingView_Multi({
  roomId,
  playerId,
  onExit,
}: WaitingViewMultiProps) {
  return (
    <VStack gap={4} width="100%" textAlign="center">
      {/* Loading Indicator */}
      <Text fontSize="lg" fontWeight="bold" color="blue.300">
        Waiting for an opponent...
      </Text>
      <Spinner color="blue.300" size="md" />

      {/* Room ID Display */}
      {roomId && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          maxWidth="600px"
          mx="auto"
        >
          <Stack
            direction="row"
            gap={0}
            align="center"
            borderWidth="1px"
            borderColor="gray.600"
            borderRadius="md"
            bg="gray.700"
            overflow="hidden"
            width="fit"
          >
            <InputAddon bg="gray.600" color="white" fontWeight="bold">
              Room ID:
            </InputAddon>
            <Input
              value={roomId || ""}
              readOnly
              border="none"
              bg="gray.700"
              color="gray.300"
              flex="1"
              focusRing="none"
            />
            <Box>
              <CopyButton value={roomId || ""} />
            </Box>
          </Stack>
        </Box>
      )}

      {/* Exit Button */}
      <ExitButton
        roomId={roomId || ""}
        playerId={playerId}
        onPlayerExit={onExit}
      />
    </VStack>
  );
}
