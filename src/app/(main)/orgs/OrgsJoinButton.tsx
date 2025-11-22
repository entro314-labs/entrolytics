import { Button, Icon, Modal, DialogTrigger, Dialog, Text, useToast } from '@entro314labs/entro-zen'
import { UserPlus as AddUser } from '@/components/icons'
import { useMessages, useModified } from '@/components/hooks'
import { OrgJoinForm } from './OrgJoinForm'

export function OrgsJoinButton() {
  const { formatMessage, labels, messages } = useMessages()
  const { toast } = useToast()
  const { touch } = useModified()

  const handleJoin = () => {
    toast(formatMessage(messages.saved))
    touch('orgs')
  }

  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <AddUser />
        </Icon>
        <Text>{formatMessage(labels.joinOrg)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.joinOrg)} style={{ width: 400 }}>
          {({ close }) => <OrgJoinForm onSave={handleJoin} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  )
}
