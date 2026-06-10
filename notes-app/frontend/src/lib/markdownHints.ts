export type MarkdownHint = {
  label: string
  description: string
  insertText: string
  selectionStart: number
  selectionEnd: number
  block?: boolean
}

export const MARKDOWN_HINTS: MarkdownHint[] = [
  {
    label: 'Heading',
    description: '# Heading',
    insertText: '# Heading',
    selectionStart: 2,
    selectionEnd: 9,
    block: true,
  },
  {
    label: 'Subheading',
    description: '## Subheading',
    insertText: '## Subheading',
    selectionStart: 3,
    selectionEnd: 13,
    block: true,
  },
  {
    label: 'Bold',
    description: '**bold text**',
    insertText: '**bold text**',
    selectionStart: 2,
    selectionEnd: 11,
  },
  {
    label: 'Italic',
    description: '*italic text*',
    insertText: '*italic text*',
    selectionStart: 1,
    selectionEnd: 12,
  },
  {
    label: 'List item',
    description: '- List item',
    insertText: '- List item',
    selectionStart: 2,
    selectionEnd: 11,
    block: true,
  },
  {
    label: 'Link',
    description: '[link text](https://example.com)',
    insertText: '[link text](https://example.com)',
    selectionStart: 1,
    selectionEnd: 10,
  },
  {
    label: 'Code block',
    description: '``` code ```',
    insertText: '```\ncode block\n```',
    selectionStart: 4,
    selectionEnd: 14,
    block: true,
  },
]
