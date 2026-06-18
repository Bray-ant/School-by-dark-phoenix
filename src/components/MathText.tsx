"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface MathTextProps {
  text: string;
  className?: string;
  block?: boolean;
}

/**
 * Renders a string that may contain HTML plus inline math ($...$)
 * and block math ($$...$$) delimiters. HTML parts are rendered via
 * dangerouslySetInnerHTML; math parts are rendered with KaTeX.
 */
export default function MathText({ text, className, block = false }: MathTextProps) {
  if (!text) return null;

  const tokens: { type: "html" | "math" | "blockMath"; content: string }[] = [];
  let remaining = text;

  // First pass: extract block math $$...$$
  const blockRegex = /\$\$(.*?)\$\$/s;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(remaining)) !== null) {
    if (match.index > 0) {
      tokens.push({ type: "html", content: remaining.slice(0, match.index) });
    }
    tokens.push({ type: "blockMath", content: match[1] });
    remaining = remaining.slice(match.index + match[0].length);
  }
  if (remaining) {
    tokens.push({ type: "html", content: remaining });
  }

  // Second pass: extract inline math $...$ inside html tokens
  const finalTokens: { type: "html" | "math" | "blockMath"; content: string }[] = [];
  for (const token of tokens) {
    if (token.type !== "html") {
      finalTokens.push(token);
      continue;
    }
    const inlineRegex = /\$(.*?)\$/s;
    let rem = token.content;
    let m: RegExpExecArray | null;
    while ((m = inlineRegex.exec(rem)) !== null) {
      if (m.index > 0) {
        finalTokens.push({ type: "html", content: rem.slice(0, m.index) });
      }
      finalTokens.push({ type: "math", content: m[1] });
      rem = rem.slice(m.index + m[0].length);
    }
    if (rem) {
      finalTokens.push({ type: "html", content: rem });
    }
  }

  const children = finalTokens.map((token, i) => {
    if (token.type === "blockMath") {
      return <BlockMath key={i} math={token.content} />;
    }
    if (token.type === "math") {
      return <InlineMath key={i} math={token.content} />;
    }
    return <span key={i} dangerouslySetInnerHTML={{ __html: token.content }} />;
  });

  if (block) {
    return <div className={className}>{children}</div>;
  }
  return <span className={className}>{children}</span>;
}
