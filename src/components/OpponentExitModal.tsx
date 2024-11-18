import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Button,
} from "@chakra-ui/react";

interface OpponentExitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpponentExitModal({
  isOpen,
  onClose,
}: OpponentExitModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Opponent Left</ModalHeader>
        <ModalBody>
          <Text>The other player has exited the game.</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" onClick={onClose}>
            Exit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
