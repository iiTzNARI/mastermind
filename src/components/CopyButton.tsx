"use client";

import { ClipboardRoot, ClipboardIconButton } from "@/components/ui/clipboard";
// import { LuCopy, LuCopyCheck } from "react-icons/lu";

interface CopyButtonProps {
  value: string; // コピーする文字列
  label?: string; // ボタンに付与する説明ラベル（オプション）
}

export default function CopyButton({
  value,
  label = "Copy to clipboard",
}: CopyButtonProps) {
  return (
    <ClipboardRoot value={value}>
      <ClipboardIconButton
        aria-label={label}
        className="relative flex items-center justify-center px-2 py-1 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      />
    </ClipboardRoot>
  );
}
