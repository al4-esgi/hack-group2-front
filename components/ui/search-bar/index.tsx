import React from 'react'
import { Input, InputField, InputIcon } from '@/components/ui/input'
import type { IInputProps } from '@/components/ui/input'

type SearchBarProps = Omit<IInputProps, 'children'> & {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Rechercher...',
  ...inputProps
}: SearchBarProps) {
  return (
    <Input variant="outline" size="lg" {...inputProps}>
      <InputField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="$text-secondary"
      />
    </Input>
  )
}
