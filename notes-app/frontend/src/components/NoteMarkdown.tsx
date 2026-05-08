import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

type NoteMarkdownProps = {
  markdown: string
  className?: string
}

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="font-heading mt-6 mb-3 text-2xl font-semibold tracking-tight first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="font-heading mt-5 mb-2 text-xl font-semibold tracking-tight first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="font-heading mt-4 mb-2 text-lg font-semibold tracking-tight first:mt-0" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="font-heading mt-3 mb-1.5 text-base font-semibold tracking-tight first:mt-0" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="mt-3 mb-1 text-sm font-semibold tracking-tight first:mt-0" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-muted-foreground mt-3 mb-1 text-sm font-semibold tracking-tight first:mt-0" {...props}>
      {children}
    </h6>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-3 text-sm leading-relaxed last:mb-0" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-3 list-disc space-y-1 pl-6 text-sm leading-relaxed last:mb-0" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-6 text-sm leading-relaxed last:mb-0" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="[&>p]:mb-1 [&>p:last-child]:mb-0" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-border text-muted-foreground [&_p]:text-muted-foreground mb-3 border-l-2 py-0.5 pl-4 text-sm italic last:mb-0"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, href, ...props }) => {
    const external =
      typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'))
    return (
      <a
        href={href}
        className="text-primary decoration-primary/40 font-medium underline underline-offset-4 hover:decoration-primary"
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : { rel: undefined })}
        {...props}
      >
        {children}
      </a>
    )
  },
  hr: ({ ...props }) => <hr className="border-border my-6" {...props} />,
  strong: ({ children, ...props }) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === 'string' && /language-[\w-]+/.test(className)
    return (
      <code
        {...props}
        className={cn(
          isBlock
            ? 'font-mono text-[0.8125rem] leading-relaxed'
            : 'bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.8125rem]',
          className,
        )}
      >
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      className="bg-muted/80 border-border mb-3 max-h-[min(24rem,50svh)] overflow-x-auto rounded-lg border p-3 text-sm last:mb-0"
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }) => (
    <div className="mb-3 max-w-full overflow-x-auto last:mb-0">
      <table className="border-border w-full min-w-[16rem] border-collapse border text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => <thead className="bg-muted/50" {...props}>{children}</thead>,
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => <tr className="border-border border-b last:border-0" {...props}>{children}</tr>,
  th: ({ children, ...props }) => (
    <th className="border-border border px-2 py-2 text-left text-xs font-semibold tracking-wide uppercase" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-border border px-2 py-1.5 align-top" {...props}>
      {children}
    </td>
  ),
  img: ({ src, alt, ...props }) => (
    <img
      src={src}
      alt={alt ?? ''}
      className="border-border my-3 h-auto max-w-full rounded-md border"
      {...props}
    />
  ),
}

export function NoteMarkdown({ markdown, className }: NoteMarkdownProps) {
  return (
    <div className={cn('text-foreground [&_a]:break-all [&_code]:break-words [&_pre_code]:break-normal', className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </Markdown>
    </div>
  )
}
