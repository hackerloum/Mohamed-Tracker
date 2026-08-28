interface TimelineItemProps {
  title: string;
  summary: string;
  timeLabel: string;
}

export function TimelineItem({ title, summary, timeLabel }: TimelineItemProps) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-4 py-3">
      <span className="tabular text-sm text-ink-muted">{timeLabel}</span>
      <span>
        <span className="block text-[0.98rem] text-ink">{title}</span>
        {summary ? <span className="text-sm text-ink-muted">{summary}</span> : null}
      </span>
    </div>
  );
}
