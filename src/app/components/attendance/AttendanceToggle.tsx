import React from 'react'
import { Button } from '../ui/button'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'

interface AttendanceToggleProps {
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | null
  onChange: (status: 'PRESENT' | 'ABSENT' | 'LEAVE') => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export const AttendanceToggle: React.FC<AttendanceToggleProps> = ({
  status,
  onChange,
  size = 'md',
  disabled = false,
}) => {
  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'
  const statuses: Array<'PRESENT' | 'ABSENT' | 'LEAVE'> = ['PRESENT', 'ABSENT', 'LEAVE']

  return (
    <div className="flex gap-1 flex-wrap">
      {statuses.map((s) => (
        <Button
          key={s}
          variant={status === s ? 'default' : 'outline'}
          size={buttonSize}
          onClick={() => onChange(s)}
          disabled={disabled}
          className="min-w-[80px]"
        >
          {s === 'PRESENT' && '✓ Present'}
          {s === 'ABSENT' && '✗ Absent'}
          {s === 'LEAVE' && '○ Leave'}
        </Button>
      ))}
    </div>
  )
}
