import type { NoteResponse } from '@/api/client'

const MAX_FILENAME_LENGTH = 120

/** Strip characters unsafe in filenames across common OSes. */
export function sanitizeNoteFilenameBase(name: string): string {
  const trimmed = name.trim()
  const withoutIllegal = trimmed.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
  const collapsed = withoutIllegal.replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '')
  const limited =
    collapsed.length > MAX_FILENAME_LENGTH
      ? collapsed.slice(0, MAX_FILENAME_LENGTH).replace(/[-.]+$/g, '')
      : collapsed
  return limited
}

/** Title line + body, suitable for a single .md export. */
export function buildNoteMarkdownDocument(title: string, contentMarkdown: string): string {
  const t = title.trim()
  const body = contentMarkdown ?? ''
  if (t.length > 0) {
    return `# ${t}\n\n${body}`
  }
  return body
}

export function noteMarkdownDownloadFilename(note: Pick<NoteResponse, 'id' | 'title'>): string {
  const base = sanitizeNoteFilenameBase(note.title)
  const stem = base.length > 0 ? base : `note-${note.id}`
  return `${stem}.md`
}

export function downloadMarkdownAsFile(filename: string, markdown: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadNoteAsMarkdown(note: NoteResponse): void {
  downloadMarkdownAsFile(
    noteMarkdownDownloadFilename(note),
    buildNoteMarkdownDocument(note.title ?? '', note.contentMarkdown ?? ''),
  )
}
