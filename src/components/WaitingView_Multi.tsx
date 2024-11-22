"use client";

import { VStack, Text, Spinner, Input, Stack } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
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
    <VStack gap={4} maxWidth="sm" width="100%" textAlign="center">
      {/* Loading Indicator */}
      <Text fontSize="lg" fontWeight="bold" color="blue.300">
        Waiting for an opponent...
      </Text>
      <Spinner color="blue.300" size="md" />

      {/* Room ID Display */}
      {roomId && (
        <Field label="Room ID">
          <Stack direction="row" align="center" gap={2}>
            <Input
              value={roomId}
              readOnly
              bg="gray.700"
              borderColor="gray.600"
              color="gray.300"
            />
            <CopyButton value={roomId} />
          </Stack>
        </Field>
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
