import { TypeConfirmationForm } from '@/components/common/TypeConfirmationForm'
import { useDeleteQuery, useMessages } from '@/components/hooks'

const CONFIRM_VALUE = 'DELETE'

export function OrgDeleteForm({
  orgId,
  onSave,
  onClose,
}: {
  orgId: string
  onSave?: () => void
  onClose?: () => void
}) {
  const { labels, formatMessage } = useMessages()
  const { mutateAsync, error, isPending, touch } = useDeleteQuery(`/orgs/${orgId}`)

  const handleConfirm = async () => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch('orgs')
        onSave?.()
        onClose?.()
      },
    })
  }

  return (
    <TypeConfirmationForm
      confirmationValue={CONFIRM_VALUE}
      onConfirm={handleConfirm}
      onClose={onClose}
      isLoading={isPending}
      error={error}
      buttonLabel={formatMessage(labels.delete)}
      buttonVariant="danger"
    />
  )
}
