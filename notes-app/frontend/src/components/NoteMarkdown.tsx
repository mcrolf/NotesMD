import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

type NoteMarkdownProps = {
  markdown: string
  className?: string
}

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="note-markdown-h1" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="note-markdown-h2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="note-markdown-h3" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="note-markdown-h4" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="note-markdown-h5" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="note-markdown-h6" {...props}>
      {children}
    </h6>
  ),
  p: ({ children, ...props }) => (
    <p className="note-markdown-p" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="note-markdown-ul" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="note-markdown-ol" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="note-markdown-li" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="note-markdown-blockquote" {...props}>
      {children}
    </blockquote>
  ),
  a: ({ children, href, ...props }) => {
    const external =
      typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'))
    return (
      <a
        href={href}
        className="note-markdown-link"
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : { rel: undefined })}
        {...props}
      >
        {children}
      </a>
    )
  },
  hr: ({ ...props }) => <hr className="note-markdown-hr" {...props} />,
  strong: ({ children, ...props }) => (
    <strong className="note-markdown-strong" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="note-markdown-em" {...props}>
      {children}
    </em>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === 'string' && /language-[\w-]+/.test(className)
    return (
      <code
        {...props}
        className={cn(
          isBlock ? 'note-markdown-code-block' : 'note-markdown-code',
          className,
        )}
      >
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => (
    <pre {...props} className="note-markdown-pre">
      {children}
    </pre>
  ),
  table: ({ children, ...props }) => (
    <div className="note-markdown-table-wrap">
      <table className="note-markdown-table" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => <thead className="note-markdown-thead" {...props}>{children}</thead>,
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => <tr className="note-markdown-tr" {...props}>{children}</tr>,
  th: ({ children, ...props }) => (
    <th className="note-markdown-th" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="note-markdown-td" {...props}>
      {children}
    </td>
  ),
  img: ({ src, alt, ...props }) => (
    <img
      src={src}
      alt={alt ?? ''}
      className="note-markdown-img"
      {...props}
    />
  ),
}

export function NoteMarkdown({ markdown, className }: NoteMarkdownProps) {
  return (
    <div className={cn('note-markdown', className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </Markdown>
    </div>
  )
}
