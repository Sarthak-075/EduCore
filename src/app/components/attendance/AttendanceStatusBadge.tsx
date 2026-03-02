import React from 'react'
import { Badge } from '../ui/badge'

interface AttendanceStatusBadgeProps {
  status: 'PRESENT' | 'ABSENT' | 'LEAVE'
  size?: 'sm' | 'md' | 'lg'
}

export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PRESENT: 'default',
    ABSENT: 'destructive',
    LEAVE: 'secondary',
  }

  const labels: Record<string, string> = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LEAVE: 'Leave',
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <Badge variant={variants[status]} className={sizeClasses[size]}>
      {labels[status]}
    </Badge>
  )
}
