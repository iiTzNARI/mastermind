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

interface ResultMultiModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWinner: boolean;
}

export default function ResultMultiModal({
  isOpen,
  onClose,
  isWinner,
}: ResultMultiModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isWinner ? "Victory!" : "Defeat"}</ModalHeader>
        <ModalBody>
          <Text>{isWinner ? "Congratulations!" : "Try again."}</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
