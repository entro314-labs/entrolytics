import { Button, Column, DialogTrigger, Icon, Label, Popover } from '@entro314labs/entro-zen';
import { DateRangeSetting } from '@/app/(main)/settings/preferences/DateRangeSetting';
import { TimezoneSetting } from '@/app/(main)/settings/preferences/TimezoneSetting';
import { useMessages } from '@/components/hooks';
import { Settings as Gear } from '@/components/icons';

export function SettingsButton() {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Icon>
          <Gear />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Column gap="3">
          <Label>{formatMessage(labels.timezone)}</Label>
          <TimezoneSetting />
          <Label>{formatMessage(labels.defaultDateRange)}</Label>
          <DateRangeSetting />
        </Column>
      </Popover>
    </DialogTrigger>
  );
}
