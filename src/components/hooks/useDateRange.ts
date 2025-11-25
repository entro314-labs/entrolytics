import { useMemo } from 'react';
import { useLocale } from '@/components/hooks/useLocale';
import { useNavigation } from '@/components/hooks/useNavigation';
import { DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';
import { getCompareDate, getOffsetDateRange, parseDateRange } from '@/lib/date';

export function useDateRange(options: { ignoreOffset?: boolean; timezone?: string } = {}) {
  const {
    query: { date = DEFAULT_DATE_RANGE_VALUE, offset = 0, compare = 'prev', all },
  } = useNavigation();
  const { locale } = useLocale();

  const dateRange = useMemo(() => {
    const dateRangeObject = parseDateRange(date, locale, options.timezone);

    return !options.ignoreOffset && offset
      ? getOffsetDateRange(dateRangeObject, +offset)
      : dateRangeObject;
  }, [date, offset, options, locale]);

  const dateCompare = getCompareDate(compare, dateRange.startDate, dateRange.endDate);

  return {
    date,
    offset,
    compare,
    isAllTime: !!all,
    isCustomRange: date.startsWith('range:'),
    dateRange,
    dateCompare,
  };
}
