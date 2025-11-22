import { useMessages } from '@/components/hooks'
import { Plus } from '@/components/icons'
import { CohortEditForm } from './CohortEditForm'
import { DialogButton } from '@/components/input/DialogButton'

export function CohortAddButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages()

  return (
    <DialogButton
      icon={<Plus />}
      label={formatMessage(labels.cohort)}
      variant="primary"
      width="800px"
    >
      {({ close }) => {
        return <CohortEditForm websiteId={websiteId} onClose={close} />
      }}
    </DialogButton>
  )
}
