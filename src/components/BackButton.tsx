"use client";

import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

interface BackButtonProps {
  label?: string;
  onClickOverride?: () => void;
}

export default function BackButton({
  label = "Back",
  onClickOverride,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClickOverride) {
      onClickOverride();
    } else {
      router.back();
    }
  };

  return (
    <Button
      colorScheme="gray"
      variant="outline"
      onClick={handleClick}
      size="md"
      mt={4}
    >
      <LuArrowLeft />
      {label}
    </Button>
  );
}
