import { Form, FormField, FormSubmitButton, Row, TextField, Button } from '@entro314labs/entro-zen'
import { useUpdateQuery, useModified, useBoardQuery, useMessages } from '@/components/hooks'

export function BoardAddForm({
  boardId,
  orgId,
  onSave,
  onClose,
}: {
  boardId?: string
  orgId?: string
  onSave?: () => void
  onClose?: () => void
}) {
  const { formatMessage, labels, messages } = useMessages()
  const { touch } = useModified()
  const { data: board, isLoading } = useBoardQuery(boardId)
  const { mutateAsync, error, isPending, toast } = useUpdateQuery(
    boardId ? `/boards/${boardId}` : '/boards',
    { id: boardId, orgId }
  )

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved))
        touch('boards')
        onSave?.()
        onClose?.()
      },
    })
  }

  if (boardId && isLoading) {
    return null
  }

  return (
    <Form onSubmit={handleSubmit} error={error?.message} defaultValues={board}>
      <FormField
        label={formatMessage(labels.name)}
        data-test="input-name"
        name="name"
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoComplete="off" />
      </FormField>

      <FormField
        label={formatMessage(labels.description)}
        data-test="input-description"
        name="description"
      >
        <TextField autoComplete="off" />
      </FormField>

      <Row justifyContent="flex-end" paddingTop="3" gap="3">
        {onClose && (
          <Button isDisabled={isPending} onPress={onClose}>
            {formatMessage(labels.cancel)}
          </Button>
        )}
        <FormSubmitButton data-test="button-submit" isDisabled={isPending}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </Row>
    </Form>
  )
}
