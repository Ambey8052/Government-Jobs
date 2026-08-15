import { differenceInCalendarDays, format } from 'date-fns';

export function formatDate(date) {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
}

export function daysLeft(date) {
  if (!date) return null;
  return differenceInCalendarDays(new Date(date), new Date());
}

export function formatSalary(min, max, payScaleText) {
  if (payScaleText) return payScaleText;
  if (min && max) return `Rs. ${min.toLocaleString('en-IN')} - ${max.toLocaleString('en-IN')} / month`;
  if (min) return `From Rs. ${min.toLocaleString('en-IN')} / month`;
  return 'Not specified';
}

export function statusTone(status) {
  switch (status) {
    case 'Active':
      return 'bg-emerald-50 text-emerald-700';
    case 'Closing Soon':
      return 'bg-amber-50 text-amber-700';
    case 'Upcoming':
      return 'bg-sky-50 text-sky-700';
    default:
      return 'bg-slate-100 text-slate-500';
  }
}
