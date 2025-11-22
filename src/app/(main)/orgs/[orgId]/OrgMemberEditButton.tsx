import { useMessages, useModified } from '@/components/hooks'
import { Dialog, useToast } from '@entro314labs/entro-zen'
import { OrgMemberEditForm } from './OrgMemberEditForm'
import { ActionButton } from '@/components/input/ActionButton'
import { Edit } from '@/components/icons'

export function OrgMemberEditButton({
  orgId,
  userId,
  role,
  onSave,
}: {
  orgId: string
  userId: string
  role: string
  onSave?: () => void
}) {
  const { formatMessage, labels, messages } = useMessages()
  const { toast } = useToast()
  const { touch } = useModified()

  const handleSave = () => {
    touch('orgs:members')
    toast(formatMessage(messages.saved))
    onSave?.()
  }

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog title={formatMessage(labels.editMember)} style={{ width: 400 }}>
        {({ close }) => (
          <OrgMemberEditForm
            orgId={orgId}
            userId={userId}
            role={role}
            onSave={handleSave}
            onClose={close}
          />
        )}
      </Dialog>
    </ActionButton>
  )
}
