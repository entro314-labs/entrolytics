import { Dialog } from '@entro314labs/entro-zen'
import { ActionButton } from '@/components/input/ActionButton'
import { Trash } from '@/components/icons'
import { ConfirmationForm } from '@/components/common/ConfirmationForm'
import { messages } from '@/components/messages'
import { useDeleteQuery, useMessages } from '@/components/hooks'

export function CohortDeleteButton({
  cohortId,
  websiteId,
  name,
  onSave,
}: {
  cohortId: string
  websiteId: string
  name: string
  onSave?: () => void
}) {
  const { formatMessage, labels, getErrorMessage, FormattedMessage } = useMessages()
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(
    `/websites/${websiteId}/segments/${cohortId}`
  )

  return (
    <ActionButton title={formatMessage(labels.delete)} icon={<Trash />}>
      <Dialog title={formatMessage(labels.confirm)} style={{ width: 400 }}>
        {({ close }) => {
          const handleConfirm = async () => {
            await mutateAsync(null, {
              onSuccess: () => {
                touch('cohorts')
                onSave?.()
                close()
              },
            })
          }

          return (
            <ConfirmationForm
              message={
                <FormattedMessage
                  {...messages.confirmRemove}
                  values={{
                    target: <b>{name}</b>,
                  }}
                />
              }
              isLoading={isPending}
              error={getErrorMessage(error)}
              onConfirm={handleConfirm}
              onClose={close}
              buttonLabel={formatMessage(labels.delete)}
              buttonVariant="danger"
            />
          )
        }}
      </Dialog>
    </ActionButton>
  )
}
