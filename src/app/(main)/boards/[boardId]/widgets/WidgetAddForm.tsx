'use client';
import {
  Button,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Label,
  ListItem,
  Row,
  Select,
  TextField,
} from '@entro314labs/entro-zen';
import { useMessages, useModified, useUpdateQuery, useWebsitesQuery } from '@/components/hooks';

const WIDGET_TYPES = [
  { value: 'stats', label: 'Statistics' },
  { value: 'chart', label: 'Traffic Chart' },
  { value: 'list', label: 'Top List' },
  { value: 'map', label: 'World Map' },
  { value: 'heatmap', label: 'Weekly Heatmap' },
];

const LIST_TYPES = [
  { value: 'path', label: 'Pages' },
  { value: 'referrer', label: 'Referrers' },
  { value: 'country', label: 'Countries' },
  { value: 'browser', label: 'Browsers' },
  { value: 'os', label: 'Operating Systems' },
  { value: 'device', label: 'Devices' },
  { value: 'channel', label: 'Channels' },
  { value: 'entry', label: 'Entry Pages' },
  { value: 'exit', label: 'Exit Pages' },
];

export function WidgetAddForm({
  boardId,
  onSave,
  onClose,
}: {
  boardId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { touch } = useModified();
  const { data: websitesData } = useWebsitesQuery({});
  const websites = websitesData?.data || [];
  const { mutateAsync, error, isPending, toast } = useUpdateQuery(`/boards/${boardId}/widgets`);

  const handleSubmit = async (data: any) => {
    const config: any = {};

    if (data.type === 'list' && data.listType) {
      config.type = data.listType;
      config.limit = 10;
    }

    await mutateAsync(
      {
        websiteId: data.websiteId,
        type: data.type,
        title: data.title || null,
        config: Object.keys(config).length > 0 ? config : null,
      },
      {
        onSuccess: async () => {
          toast(formatMessage(messages.saved));
          touch(`board-widgets:${boardId}`);
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  return (
    <Form
      onSubmit={handleSubmit}
      error={error?.message}
      defaultValues={{ type: 'stats', listType: 'path' }}
    >
      {({ watch }) => {
        const selectedType = watch('type');

        return (
          <>
            <Column gap="1">
              <Label>{formatMessage(labels.website)}</Label>
              <FormField name="websiteId" rules={{ required: formatMessage(labels.required) }}>
                <Select placeholder={formatMessage(labels.selectWebsite)}>
                  {websites.map((website: any) => (
                    <ListItem key={website.websiteId} id={website.websiteId}>
                      {website.name}
                    </ListItem>
                  ))}
                </Select>
              </FormField>
            </Column>

            <Column gap="1">
              <Label>{formatMessage(labels.type)}</Label>
              <FormField name="type" rules={{ required: formatMessage(labels.required) }}>
                <Select>
                  {WIDGET_TYPES.map(type => (
                    <ListItem key={type.value} id={type.value}>
                      {type.label}
                    </ListItem>
                  ))}
                </Select>
              </FormField>
            </Column>

            {selectedType === 'list' && (
              <Column gap="1">
                <Label>{formatMessage(labels.field)}</Label>
                <FormField name="listType">
                  <Select>
                    {LIST_TYPES.map(type => (
                      <ListItem key={type.value} id={type.value}>
                        {type.label}
                      </ListItem>
                    ))}
                  </Select>
                </FormField>
              </Column>
            )}

            <FormField label={formatMessage(labels.title)} name="title">
              <TextField autoComplete="off" />
            </FormField>

            <Row justifyContent="flex-end" paddingTop="3" gap="3">
              {onClose && (
                <Button isDisabled={isPending} onPress={onClose}>
                  {formatMessage(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton isDisabled={isPending}>
                {formatMessage(labels.save)}
              </FormSubmitButton>
            </Row>
          </>
        );
      }}
    </Form>
  );
}
