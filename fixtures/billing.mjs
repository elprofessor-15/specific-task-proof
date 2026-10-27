// Original synthetic fixture. Integer cents, inclusive start, exclusive end.
export function charge(seat, period, variant) {
  const day = 86400000;
  const days = (Date.parse(period.end)-Date.parse(period.start))/day;
  const start = variant === 'baseline' ? Date.parse(period.start) : Math.max(Date.parse(seat.started),Date.parse(period.start));
  const end = variant === 'ignores-cancellation' || variant === 'baseline' ? Date.parse(period.end) : Math.min(Date.parse(seat.ended ?? period.end),Date.parse(period.end));
  const active = Math.max(0,(end-start)/day);
  if (variant === 'rounds-early') return Math.round(period.price/days)*active;
  return Math.round(period.price*active/days);
}
