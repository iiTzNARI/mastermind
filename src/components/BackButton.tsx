"use client";

import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string; // ボタンに表示するテキスト (デフォルトは "Back")
  onClickOverride?: () => void; // 戻る機能をオーバーライドする関数
}

export default function BackButton({
  label = "Back",
  onClickOverride,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClickOverride) {
      onClickOverride(); // オーバーライドされた関数を実行
    } else {
      router.back(); // 1つ前の画面に戻る
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
      {label}
    </Button>
  );
}
