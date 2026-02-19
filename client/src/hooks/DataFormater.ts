import { format, isToday, isYesterday } from "date-fns";

export function formatMessageTime(dateString: string) {
  const date = new Date(dateString.replace(" ", "T"));

  const time = format(date, "HH:mm");

  if (isToday(date)) return `aujourd'hui a ${time}`;
  if (isYesterday(date)) return `Hier à ${time}`;

  return format(date, "dd MMM 'à' HH:mm");
}
