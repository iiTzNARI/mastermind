"use client";

import { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface RoomTimeoutModalProps {
  isOpen: boolean;
}

export default function RoomTimeoutModal({ isOpen }: RoomTimeoutModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, router]);

  return (
    <Modal isOpen={isOpen} onClose={() => {}} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Room Timeout</ModalHeader>
        <ModalBody>
          <Text>The room has been deleted due to inactivity.</Text>
          <Text mt={4}>
            You will be redirected to the homepage in 5 seconds.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
