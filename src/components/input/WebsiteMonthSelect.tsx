import { useDateRange, useNavigation } from '@/components/hooks'
import { getMonthDateRangeValue } from '@/lib/date'
import { MonthSelect } from './MonthSelect'

export function WebsiteMonthSelect({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate },
  } = useDateRange()
  const { router, updateParams } = useNavigation()

  const handleMonthSelect = (date: Date) => {
    const range = getMonthDateRangeValue(date)
    router.push(updateParams({ date: range, offset: undefined }))
  }

  return <MonthSelect date={startDate} onChange={handleMonthSelect} />
}
