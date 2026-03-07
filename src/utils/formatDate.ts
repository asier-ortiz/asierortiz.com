import { format, type Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  'en-US': enUS,
  'es-ES': es,
};

export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const selectedLocale = localeMap[locale] ?? enUS;

  return format(parsedDate, 'PPP', { locale: selectedLocale });
}
