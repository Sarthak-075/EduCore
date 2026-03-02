import React from 'react'
import { Input } from './input'
import { Search } from 'lucide-react'

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="text-base flex-1"
      />
    </div>
  )
}
