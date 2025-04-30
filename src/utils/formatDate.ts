import { format, formatDistanceToNow, differenceInDays, type Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  'en-US': enUS,
  'es-ES': es,
};

export function formatDate(
  date: string | Date,
  locale: string = 'en-US',
  options: { relative?: boolean; relativeLimitDays?: number } = {}
): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const selectedLocale = localeMap[locale] ?? enUS;

  const useRelative =
    options.relative &&
    typeof options.relativeLimitDays === 'number' &&
    differenceInDays(new Date(), parsedDate) <= options.relativeLimitDays;

  if (useRelative) {
    return formatDistanceToNow(parsedDate, { addSuffix: true, locale: selectedLocale });
  }

  return format(parsedDate, 'PPP', { locale: selectedLocale });
}
