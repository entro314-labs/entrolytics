import {
  Form,
  FormButtons,
  TextField,
  Button,
  Switch,
  FormSubmitButton,
  Column,
  Label,
  Row,
  IconLabel,
} from '@entro314labs/entro-zen'
import { useState } from 'react'
import { getRandomChars } from '@/lib/crypto'
import { useMessages, useUpdateQuery } from '@/components/hooks'
import { RefreshCcw } from '@/components/icons'

const generateId = () => getRandomChars(16)

export interface WebsiteShareFormProps {
  websiteId: string
  shareId?: string
  onSave?: () => void
  onClose?: () => void
}

export function WebsiteShareForm({ websiteId, shareId, onSave, onClose }: WebsiteShareFormProps) {
  const { formatMessage, labels, messages } = useMessages()
  const [currentId, setCurrentId] = useState(shareId)
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(`/websites/${websiteId}`)

  const url = `${window?.location.origin}${process.env.basePath || ''}/share/${currentId}`

  const handleGenerate = () => {
    setCurrentId(generateId())
  }

  const handleSwitch = () => {
    setCurrentId(currentId ? null : generateId())
  }

  const handleSave = async () => {
    const data = {
      shareId: currentId,
    }
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved))
        touch(`website:${websiteId}`)
        onSave?.()
        onClose?.()
      },
    })
  }

  return (
    <Form onSubmit={handleSave} error={error} values={{ url }}>
      <Column gap>
        <Switch isSelected={!!currentId} onChange={handleSwitch}>
          {formatMessage(labels.enableShareUrl)}
        </Switch>
        {currentId && (
          <Row alignItems="flex-end" gap>
            <Column flexGrow={1}>
              <Label>{formatMessage(labels.shareUrl)}</Label>
              <TextField value={url} isReadOnly allowCopy />
            </Column>
            <Column>
              <Button onPress={handleGenerate}>
                <IconLabel icon={<RefreshCcw />} label={formatMessage(labels.regenerate)} />
              </Button>
            </Column>
          </Row>
        )}
        <FormButtons justifyContent="flex-end">
          <Row alignItems="center" gap>
            {onClose && <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>}
            <FormSubmitButton isDisabled={false} isLoading={isPending}>
              {formatMessage(labels.save)}
            </FormSubmitButton>
          </Row>
        </FormButtons>
      </Column>
    </Form>
  )
}
