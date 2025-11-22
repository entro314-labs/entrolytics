import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem, Box } from '@entro314labs/entro-zen'

export interface FilterButtonsProps {
  items: { id: string; label: string }[]
  value: string
  onChange?: (value: string) => void
  ariaLabel?: string
}

export function FilterButtons({
  items = [],
  value,
  onChange,
  ariaLabel = 'Filter options',
}: FilterButtonsProps) {
  const [selected, setSelected] = useState(value)

  const handleChange = (value: string) => {
    setSelected(value)
    onChange?.(value)
  }

  return (
    <Box>
      <ToggleGroup
        value={[selected]}
        onChange={(e) => handleChange(e[0])}
        disallowEmptySelection={true}
        aria-label={ariaLabel}
      >
        {Array.isArray(items) &&
          items.map(({ id, label }) => (
            <ToggleGroupItem key={id} id={id}>
              {label}
            </ToggleGroupItem>
          ))}
      </ToggleGroup>
    </Box>
  )
}
