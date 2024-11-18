import {
  VStack,
  Text,
  Spinner,
  FormControl,
  InputGroup,
  Input,
  FormLabel,
  InputRightElement,
} from "@chakra-ui/react";
import CopyButton from "@/components/CopyButton";
import ExitButton from "@/components/ExitButton";

const floatingLabelStyles = {
  position: "absolute" as const,
  top: "-8px",
  left: "10px",
  backgroundColor: "gray.800",
  paddingX: "1",
  fontSize: "sm",
  color: "gray.500",
  transition: "0.2s ease",
};

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
    <VStack spacing={4} maxWidth="sm" width="100%">
      <Text>対戦相手を待っています...</Text>
      <Spinner color="blue.300" size="md" />
      {roomId && (
        <>
          <FormControl position="relative">
            <InputGroup size="md">
              <Input
                placeholder=" "
                value={roomId}
                isReadOnly
                _placeholder={{ color: "transparent" }}
              />
              <FormLabel sx={floatingLabelStyles}>Room ID</FormLabel>
              <InputRightElement width="4.5rem" pr="1">
                <CopyButton value={roomId}></CopyButton>
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </>
      )}
      <ExitButton
        roomId={roomId || ""}
        playerId={playerId}
        onPlayerExit={onExit}
      />
    </VStack>
  );
}
