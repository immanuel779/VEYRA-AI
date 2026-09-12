interface ExportMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date | null;
}

/**
 * Convert messages into a Markdown document.
 */
export function buildMarkdown(
  title: string,
  messages: ExportMessage[]
): string {
  const now = new Date().toLocaleString();
  const lines: string[] = [
    `# ${title}`,
    '',
    `_Exported from VEYRA AI · ${now}_`,
    '',
    '---',
    '',
  ];

  for (const m of messages) {
    const role = m.role === 'user' ? '**You**' : '**VEYRA AI**';
    const time = m.createdAt
      ? new Date(m.createdAt).toLocaleString()
      : '';
    lines.push(`### ${role}${time ? ` — ${time}` : ''}`);
    lines.push('');
    lines.push(m.content.trim());
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('');
  lines.push(`_${messages.length} messages_`);

  return lines.join('\n');
}

/**
 * Convert messages into a plain-text document.
 */
export function buildText(
  title: string,
  messages: ExportMessage[]
): string {
  const now = new Date().toLocaleString();
  const lines: string[] = [
    title.toUpperCase(),
    '='.repeat(title.length),
    `Exported from VEYRA AI · ${now}`,
    '',
  ];

  for (const m of messages) {
    const role = m.role === 'user' ? 'You' : 'VEYRA AI';
    const time = m.createdAt
      ? ` (${new Date(m.createdAt).toLocaleString()})`
      : '';
    lines.push(`${role}${time}:`);
    lines.push(m.content.trim());
    lines.push('');
  }

  lines.push(`${messages.length} messages`);

  return lines.join('\n');
}

/**
 * Turn a title into a safe filename.
 */
export function sanitizeFilename(name: string): string {
  const cleaned = name
    .replace(/[^a-z0-9\-_ ]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 60);
  return cleaned || 'conversation';
}

/**
 * Trigger a browser download.
 */
export function downloadFile(
  filename: string,
  content: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Full pipeline — builds the file and downloads it.
 */
export function exportConversation(
  title: string,
  messages: ExportMessage[],
  format: 'markdown' | 'text' = 'markdown'
): void {
  if (messages.length === 0) return;

  if (format === 'markdown') {
    const md = buildMarkdown(title, messages);
    downloadFile(`${sanitizeFilename(title)}.md`, md, 'text/markdown');
  } else {
    const txt = buildText(title, messages);
    downloadFile(`${sanitizeFilename(title)}.txt`, txt, 'text/plain');
  }
}
