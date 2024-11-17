import { Button, useClipboard, Tooltip } from "@chakra-ui/react";
import { useState } from "react";
import { LuCopy, LuCopyCheck } from "react-icons/lu";

interface CopyButtonProps {
  value: string; // コピーする文字列
  label?: string; // ツールチップに表示するテキスト（任意）
  buttonSize?: string; // ボタンのサイズ（デフォルト: sm）
  colorScheme?: string; // ボタンのカラースキーム（デフォルト: gray）
}

export default function CopyButton({
  value,
  label = "Copy to clipboard",
  buttonSize = "sm",
  colorScheme = "gray",
}: CopyButtonProps) {
  const { hasCopied, onCopy } = useClipboard(value);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleMouseEnter = () => setTooltipOpen(true);
  const handleMouseLeave = () => setTooltipOpen(false);

  return (
    <Tooltip
      label={hasCopied ? "Copied!" : label}
      isOpen={tooltipOpen}
      hasArrow
      placement="top"
    >
      <Button
        size={buttonSize}
        colorScheme={colorScheme}
        bg="gray.600"
        onClick={onCopy}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        _hover={{ bg: `${colorScheme}.600` }}
      >
        {hasCopied ? <LuCopyCheck /> : <LuCopy />}
      </Button>
    </Tooltip>
  );
}
