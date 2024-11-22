import { Button, Text } from "@chakra-ui/react";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

interface FinishGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FinishGameModal({
  isOpen,
  onClose,
}: FinishGameModalProps) {
  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTrigger asChild>
        {/* 空要素でトリガーを隠します */}
        <div />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room Deleted</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            The room has been automatically deleted due to inactivity.
          </Text>
        </DialogBody>
        <DialogFooter>
          <DialogCloseTrigger asChild>
            <Button colorScheme="blue">Back to Home</Button>
          </DialogCloseTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
