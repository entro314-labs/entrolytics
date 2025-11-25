import { Button, Row } from '@entro314labs/entro-zen';
import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
import { DateFilter } from '@/components/input/DateFilter';
import { DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';

export function DateRangeSetting() {
  const { formatMessage, labels } = useMessages();
  const { dateRange } = useDateRange();
  const { value } = dateRange;
  const { router, updateParams } = useNavigation();

  const handleChange = (value: string) => {
    router.push(updateParams({ date: value, offset: undefined }));
  };
  const handleReset = () =>
    router.push(updateParams({ date: DEFAULT_DATE_RANGE_VALUE, offset: undefined }));

  return (
    <Row gap="3">
      <DateFilter value={value} onChange={handleChange} />
      <Button onPress={handleReset}>{formatMessage(labels.reset)}</Button>
    </Row>
  );
}
