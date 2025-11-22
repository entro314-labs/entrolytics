import { setItem } from '@/lib/storage'
import { TIMEZONE_CONFIG } from '@/lib/constants'
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { useApp, setTimezone } from '@/store/app'
import { useLocale } from './useLocale'
import { getTimezone } from '@/lib/date'

const selector = (state: { timezone: string }) => state.timezone

export function useTimezone() {
  const timezone = useApp(selector)
  const localTimeZone = getTimezone()
  const { dateLocale } = useLocale()

  const saveTimezone = (value: string) => {
    setItem(TIMEZONE_CONFIG, value)
    setTimezone(value)
  }

  const formatTimezoneDate = (date: string, pattern: string) => {
    return formatInTimeZone(
      /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{3})?Z$/.test(date)
        ? date
        : date.split(' ').join('T') + 'Z',
      timezone,
      pattern,
      { locale: dateLocale }
    )
  }

  const formatSeriesTimezone = (data: any[], column: string, tz: string) => {
    return data.map((item) => {
      const date = new Date(item[column])

      const format = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const parts = format.formatToParts(date)
      const get = (type: string) => parts.find((p) => p.type === type)?.value

      const year = get('year')
      const month = get('month')
      const day = get('day')
      const hour = get('hour')
      const minute = get('minute')
      const second = get('second')

      return {
        ...item,
        [column]: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
      }
    })
  }

  const toUtc = (date: Date | string | number) => {
    return fromZonedTime(date, timezone)
  }

  const fromUtc = (date: Date | string | number) => {
    return toZonedTime(date, timezone)
  }

  const localToUtc = (date: Date | string | number) => {
    return fromZonedTime(date, localTimeZone)
  }

  const localFromUtc = (date: Date | string | number) => {
    return toZonedTime(date, localTimeZone)
  }

  const canonicalizeTimezone = (tz: string): string => {
    // Handle legacy timezone mappings if needed
    return tz
  }

  return {
    timezone,
    localTimeZone,
    toUtc,
    fromUtc,
    localToUtc,
    localFromUtc,
    saveTimezone,
    formatTimezoneDate,
    formatSeriesTimezone,
    canonicalizeTimezone,
  }
}
