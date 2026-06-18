"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface MathProps {
  tex: string;
  block?: boolean;
  className?: string;
}

export default function Math({ tex, block = false, className }: MathProps) {
  if (!tex) return null;
  if (block) {
    return (
      <div className={className}>
        <BlockMath math={tex} />
      </div>
    );
  }
  return (
    <span className={className}>
      <InlineMath math={tex} />
    </span>
  );
}
