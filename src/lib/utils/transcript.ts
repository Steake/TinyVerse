export type NormalizedLog = {
  timestamp: string | Date;
  agentId?: string;
  agentName?: string;
  action?: string;
  content?: string;
};

function defaultFormatTime(ts: string | Date): string {
  try {
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    return d.toLocaleTimeString();
  } catch {
    return '';
  }
}

function needsQuoting(v: string): boolean {
  return /[",\n]/.test(v);
}

function escapeCell(v: string): string {
  const esc = v.replace(/"/g, '""');
  return needsQuoting(esc) ? `"${esc}"` : esc;
}

export function logsToCSV(logs: NormalizedLog[], formatTime: (ts: string | Date) => string = defaultFormatTime): string {
  const headers = ['timestamp', 'agentId', 'agentName', 'action', 'content'];
  const lines = [headers.join(',')];
  for (const r of logs) {
    const row = [
      (formatTime(r.timestamp) || '').replace(/,/g, ' '),
      r.agentId || '',
      r.agentName || '',
      r.action || '',
      (r.content || '').toString()
    ].map(escapeCell);
    lines.push(row.join(','));
  }
  return lines.join('\n');
}

export function logsToJSON(logs: NormalizedLog[]): string {
  return JSON.stringify(logs, null, 2);
}
