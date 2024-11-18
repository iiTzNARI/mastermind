import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";

interface FinishGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FinishGameModal({
  isOpen,
  onClose,
}: FinishGameModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Room Deleted</ModalHeader>
        <ModalBody>
          <Text>
            The room has been automatically deleted due to inactivity.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Back to Home
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
