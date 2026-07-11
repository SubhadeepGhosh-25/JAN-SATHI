import React from "react";

interface MarkdownRendererProps {
  content: string;
  preferredLanguage?: string;
}

export default function MarkdownRenderer({ content, preferredLanguage }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by empty lines to find paragraphs/blocks
  const blocks = content.split(/\n\s*\n/);

  // Helper to parse bold text **like this** and render standard text otherwise
  const renderFormattedText = (text: string) => {
    // Regex to find **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const cleanText = part.slice(2, -2);
        
        // Detect if it is a disclaimer to style it specially
        const isDisclaimer = cleanText.toLowerCase().includes("disclaimer") || 
                            cleanText.includes("अस्वीकरण") || 
                            cleanText.includes("टीप") || 
                            cleanText.includes("குறிப்பு") || 
                            cleanText.includes("గమనిక");

        return (
          <strong 
            key={index} 
            className={`font-extrabold ${
              isDisclaimer 
                ? "text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded text-xs border border-amber-200/50 inline-block" 
                : "text-slate-950 font-bold"
            }`}
          >
            {cleanText}
          </strong>
        );
      }
      return part;
    });
  };

  // Helper to parse line level elements (lists, headings, etc.)
  const renderBlockContent = (block: string, blockIndex: number) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // 1. Headers: ### Title or ## Title
    if (trimmed.startsWith("###")) {
      const headerText = trimmed.replace(/^###\s*/, "");
      return (
        <h4 key={blockIndex} className="text-sm font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2 border-l-4 border-teal-500 pl-2.5">
          {renderFormattedText(headerText)}
        </h4>
      );
    }
    if (trimmed.startsWith("##")) {
      const headerText = trimmed.replace(/^##\s*/, "");
      return (
        <h3 key={blockIndex} className="text-base font-extrabold text-slate-950 mt-5 mb-2.5 pb-1 border-b border-gray-100 flex items-center gap-2 text-[#004d99]">
          {renderFormattedText(headerText)}
        </h3>
      );
    }
    if (trimmed.startsWith("#")) {
      const headerText = trimmed.replace(/^#\s*/, "");
      return (
        <h2 key={blockIndex} className="text-lg font-black text-slate-950 mt-6 mb-3 flex items-center gap-2">
          {renderFormattedText(headerText)}
        </h2>
      );
    }

    // 2. Lists: Check if lines are list items
    const lines = trimmed.split("\n");
    const isBulletList = lines.every(line => {
      const lt = line.trim();
      return lt.startsWith("* ") || lt.startsWith("- ") || lt.startsWith("• ");
    });
    const isNumberedList = lines.every(line => {
      const lt = line.trim();
      return /^\d+\.\s+/.test(lt);
    });

    if (isBulletList) {
      return (
        <ul key={blockIndex} className="space-y-2.5 my-3 pl-1">
          {lines.map((line, lineIndex) => {
            const cleanLine = line.trim().replace(/^[\*\-•]\s*/, "");
            return (
              <li key={lineIndex} className="flex items-start gap-2.5 text-slate-700 leading-relaxed text-xs">
                {/* Clean, beautifully styled visual list bullet instead of boring default raw symbols */}
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2 shadow-sm" />
                <span className="flex-1 font-medium">{renderFormattedText(cleanLine)}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    if (isNumberedList) {
      return (
        <ol key={blockIndex} className="space-y-2.5 my-3 pl-1">
          {lines.map((line, lineIndex) => {
            const match = line.trim().match(/^(\d+)\.\s+(.*)$/);
            const num = match ? match[1] : (lineIndex + 1).toString();
            const cleanLine = match ? match[2] : line.trim();
            return (
              <li key={lineIndex} className="flex items-start gap-3 text-slate-700 leading-relaxed text-xs">
                {/* Visual badge for numbers */}
                <span className="w-5 h-5 rounded-full bg-[#004d99]/10 text-[#004d99] font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                  {num}
                </span>
                <span className="flex-grow pt-0.5 font-medium">{renderFormattedText(cleanLine)}</span>
              </li>
            );
          })}
        </ol>
      );
    }

    // 3. Fallback to standard paragraph blocks (with elegant text styling)
    // If paragraph contains individual bullet lines mixed in, handle those beautifully
    const parsedLines = lines.map((line, lineIdx) => {
      const lt = line.trim();
      if (lt.startsWith("* ") || lt.startsWith("- ") || lt.startsWith("• ")) {
        const clean = lt.replace(/^[\*\-•]\s*/, "");
        return (
          <div key={lineIdx} className="flex items-start gap-2.5 text-slate-700 leading-relaxed text-xs pl-1 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2" />
            <span className="flex-1 font-medium">{renderFormattedText(clean)}</span>
          </div>
        );
      }
      if (/^\d+\.\s+/.test(lt)) {
        const match = lt.match(/^(\d+)\.\s+(.*)$/);
        const num = match ? match[1] : "1";
        const clean = match ? match[2] : lt;
        return (
          <div key={lineIdx} className="flex items-start gap-3 text-slate-700 leading-relaxed text-xs pl-1 mt-1.5">
            <span className="w-4 h-4 rounded-full bg-[#004d99]/10 text-[#004d99] font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
              {num}
            </span>
            <span className="flex-grow font-medium">{renderFormattedText(clean)}</span>
          </div>
        );
      }

      // Detect if it is a whole disclaimer block to render with a warning card aesthetic
      const isDisclaimerBlock = lt.toLowerCase().includes("disclaimer") || 
                                lt.includes("अस्वीकरण") || 
                                lt.includes("टीप") || 
                                lt.includes("குறிப்பு") || 
                                lt.includes("గమనిక");

      if (isDisclaimerBlock) {
        return (
          <p key={lineIdx} className="text-[11px] leading-relaxed text-amber-900 bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl font-semibold my-3 flex items-start gap-2">
            <span>{renderFormattedText(lt)}</span>
          </p>
        );
      }

      return (
        <p key={lineIdx} className="leading-relaxed text-slate-700 font-medium">
          {renderFormattedText(line)}
        </p>
      );
    });

    return (
      <div key={blockIndex} className="space-y-1">
        {parsedLines}
      </div>
    );
  };

  return (
    <div className="space-y-4 text-xs md:text-sm antialiased text-gray-800">
      {blocks.map((block, index) => renderBlockContent(block, index))}
    </div>
  );
}
