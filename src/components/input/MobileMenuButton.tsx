import { Dialog, DialogTrigger, Button, Icon, Modal, DialogProps } from '@entro314labs/entro-zen'
import { Menu } from '@/components/icons'

export function MobileMenuButton(props: DialogProps) {
  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <Menu />
        </Icon>
      </Button>
      <Modal placement="left" offset="80px">
        <Dialog variant="sheet" {...props} />
      </Modal>
    </DialogTrigger>
  )
}
