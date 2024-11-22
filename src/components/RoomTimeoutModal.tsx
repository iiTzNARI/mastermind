"use client";

import { useEffect } from "react";
import { Text } from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <DialogRoot open={isOpen} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room Timeout</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>The room has been deleted due to inactivity.</Text>
          <Text mt={4}>
            You will be redirected to the homepage in 5 seconds.
          </Text>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
