'use client'
import { Dialog } from '@entro314labs/entro-zen'
import { Trash } from '@/components/icons'
import { useMessages, useModified, useDeleteQuery } from '@/components/hooks'
import { ConfirmationForm } from '@/components/common/ConfirmationForm'
import { ActionButton } from '@/components/input/ActionButton'
import { messages } from '@/components/messages'

export interface WidgetDeleteButtonProps {
  widgetId: string
  boardId: string
  title?: string
}

export function WidgetDeleteButton({ widgetId, boardId, title }: WidgetDeleteButtonProps) {
  const { formatMessage, labels, getErrorMessage, FormattedMessage } = useMessages()
  const { touch } = useModified()
  const { mutateAsync, isPending, error, toast } = useDeleteQuery(
    `/boards/${boardId}/widgets/${widgetId}`
  )

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        toast(formatMessage(messages.deleted))
        touch(`board-widgets:${boardId}`)
        close()
      },
    })
  }

  return (
    <ActionButton title={formatMessage(labels.delete)} icon={<Trash />}>
      <Dialog title={formatMessage(labels.confirm)} style={{ width: 400 }}>
        {({ close }) => (
          <ConfirmationForm
            message={
              <FormattedMessage
                {...messages.confirmDelete}
                values={{
                  target: <b>{title || formatMessage(labels.widget)}</b>,
                }}
              />
            }
            buttonLabel={formatMessage(labels.delete)}
            buttonVariant="danger"
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
            isLoading={isPending}
            error={getErrorMessage(error)}
          />
        )}
      </Dialog>
    </ActionButton>
  )
}
