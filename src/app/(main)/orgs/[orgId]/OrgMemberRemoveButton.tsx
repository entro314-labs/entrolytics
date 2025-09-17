import { ConfirmationForm } from '@/components/common/ConfirmationForm'
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks'
import { messages } from '@/components/messages'
import { Trash } from '@/components/icons'
import { Dialog } from '@entro314labs/entro-zen'
import { ActionButton } from '@/components/input/ActionButton'

export function OrgMemberRemoveButton({
  orgId,
  userId,
  userName,
  onSave,
}: {
  orgId: string
  userId: string
  userName: string
  disabled?: boolean
  onSave?: () => void
}) {
  const { formatMessage, labels } = useMessages()
  const { mutate, isPending, error } = useDeleteQuery(`/orgs/${orgId}/users/${userId}`)
  const { touch } = useModified()

  const handleConfirm = (close: () => void) => {
    mutate(null, {
      onSuccess: () => {
        touch('orgs:members')
        onSave?.()
        close()
      },
    })
  }

  return (
    <ActionButton title={formatMessage(labels.delete)} icon={<Trash />}>
      <Dialog title={formatMessage(labels.removeMember)} style={{ width: 400 }}>
        {({ close }) => (
          <ConfirmationForm
            message={formatMessage(messages.confirmRemove, {
              target: userName,
            })}
            isLoading={isPending}
            error={error}
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
            buttonLabel={formatMessage(labels.remove)}
            buttonVariant="danger"
          />
        )}
      </Dialog>
    </ActionButton>
  )
}
