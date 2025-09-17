import { useMessages, useUpdateQuery } from '@/components/hooks'
import { ROLES } from '@/lib/constants'
import {
  Button,
  Select,
  Form,
  FormButtons,
  FormField,
  ListItem,
  FormSubmitButton,
} from '@entro314labs/entro-zen'

export function OrgMemberEditForm({
  orgId,
  userId,
  role,
  onSave,
  onClose,
}: {
  orgId: string
  userId: string
  role: string
  onSave?: () => void
  onClose?: () => void
}) {
  const { mutate, error, isPending } = useUpdateQuery(`/orgs/${orgId}/users/${userId}`)
  const { formatMessage, labels } = useMessages()

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        onSave()
        onClose()
      },
    })
  }

  return (
    <Form onSubmit={handleSubmit} error={error} defaultValues={{ role }}>
      <FormField
        name="role"
        rules={{ required: formatMessage(labels.required) }}
        label={formatMessage(labels.role)}
      >
        <Select>
          <ListItem id={ROLES.orgManager}>{formatMessage(labels.manager)}</ListItem>
          <ListItem id={ROLES.orgMember}>{formatMessage(labels.member)}</ListItem>
          <ListItem id={ROLES.orgViewOnly}>{formatMessage(labels.viewOnly)}</ListItem>
        </Select>
      </FormField>

      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" isDisabled={false}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  )
}
