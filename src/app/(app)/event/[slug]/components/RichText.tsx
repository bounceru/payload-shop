"use client"
import DOMPurify from "dompurify"
import parse from "html-react-parser"

type Props = {
    content: string
    primaryColor?: string
    variant?: "default" | "compact" | "large"
    className?: string
}

export default function RichText({ content, primaryColor = "#ED6D38", variant = "default", className = "" }: Props) {
    if (!content) return null

    const clean = DOMPurify.sanitize(content)

    // Generate color variations
    const linkColor = primaryColor
    const linkHoverColor = `${primaryColor}CC` // Add transparency for hover

    const variantClasses = {
        default: "prose-base",
        compact: "prose-sm",
        large: "prose-lg",
    }

    const baseClasses = `
    prose prose-gray max-w-none
    ${variantClasses[variant]}
    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
    prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight
    prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mb-5 prose-h2:mt-7 prose-h2:leading-tight
    prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mb-4 prose-h3:mt-6 prose-h3:leading-tight
    prose-h4:text-lg prose-h4:md:text-xl prose-h4:mb-3 prose-h4:mt-5 prose-h4:leading-tight
    prose-h5:text-base prose-h5:md:text-lg prose-h5:mb-3 prose-h5:mt-4 prose-h5:leading-tight
    prose-h6:text-sm prose-h6:md:text-base prose-h6:mb-2 prose-h6:mt-4 prose-h6:leading-tight
    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
    prose-strong:font-semibold prose-strong:text-gray-900
    prose-em:italic prose-em:text-gray-600
    prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
    prose-ul:space-y-2 prose-ul:mb-4
    prose-ol:space-y-2 prose-ol:mb-4
    prose-li:text-gray-700 prose-li:leading-relaxed
    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-gray-800
    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
    prose-table:border-collapse prose-table:w-full prose-table:mb-4
    prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900
    prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-td:text-gray-700
    prose-hr:border-gray-200 prose-hr:my-8
    prose-img:rounded-lg prose-img:shadow-sm prose-img:border prose-img:border-gray-200
  `

    return (
        <div className="relative">
            {/* Background decoration */}
            <div
                className="absolute inset-0 opacity-[0.015] rounded-xl pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, ${primaryColor} 2px, transparent 2px)`,
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Content */}
            <div className={`${baseClasses} ${className} relative z-10`}>
                <style jsx>{`
          :global(.prose a) {
            color: ${linkColor};
            text-decoration: none;
            font-weight: 500;
            border-bottom: 1px solid transparent;
            transition: all 0.2s ease;
          }
          
          :global(.prose a:hover) {
            color: ${linkHoverColor};
            border-bottom-color: ${linkColor};
            transform: translateY(-1px);
          }
          
          :global(.prose blockquote) {
            border-left-color: ${primaryColor};
          }
          
          :global(.prose h1::after),
          :global(.prose h2::after) {
            content: '';
            display: block;
            width: 3rem;
            height: 3px;
            background: linear-gradient(90deg, ${primaryColor}, ${primaryColor}80);
            border-radius: 2px;
            margin-top: 0.5rem;
          }
          
          :global(.prose h3::after) {
            content: '';
            display: block;
            width: 2rem;
            height: 2px;
            background: ${primaryColor};
            border-radius: 1px;
            margin-top: 0.25rem;
            opacity: 0.7;
          }
          
          :global(.prose ul li::marker) {
            color: ${primaryColor};
          }
          
          :global(.prose ol li::marker) {
            color: ${primaryColor};
            font-weight: 600;
          }
          
          :global(.prose code) {
            color: ${primaryColor};
            background-color: ${primaryColor}10;
            border: 1px solid ${primaryColor}20;
          }
          
          :global(.prose table th) {
            background: linear-gradient(135deg, ${primaryColor}08, ${primaryColor}15);
            border-color: ${primaryColor}30;
          }
          
          :global(.prose img) {
            transition: all 0.3s ease;
          }
          
          :global(.prose img:hover) {
            transform: scale(1.02);
            shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          }
        `}</style>

                {parse(clean)}
            </div>

            {/* Reading progress indicator for long content */}
            {content.length > 1000 && (
                <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div
                            className="h-1 rounded-full transition-all duration-300"
                            style={{
                                backgroundColor: primaryColor,
                                width: "100%", // This would be dynamic in a real implementation
                            }}
                        />
                    </div>
                    <span className="text-xs">Gelezen</span>
                </div>
            )}
        </div>
    )
}
