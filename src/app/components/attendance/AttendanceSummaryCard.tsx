import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { StatCard } from '../StatCard'

export interface StudentSummary {
  studentId: string
  name: string
  totalDays: number
  presentDays: number
  absentDays: number
  leaveDays: number
  percentage: number
}

interface AttendanceSummaryCardProps {
  month: number
  year: number
  summaries: StudentSummary[]
  isLoading?: boolean
  error?: string | null
}

export const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({
  month,
  year,
  summaries,
  isLoading = false,
  error = null,
}) => {
  const stats = useMemo(() => {
    const total = summaries.length
    if (total === 0) return { avgPercentage: 0, totalPresent: 0, totalAbsent: 0, totalLeave: 0 }

    const avgPercentage =
      Math.round(
        (summaries.reduce((sum, s) => sum + s.percentage, 0) / total) * 10
      ) / 10

    return {
      avgPercentage,
      totalPresent: summaries.reduce((sum, s) => sum + s.presentDays, 0),
      totalAbsent: summaries.reduce((sum, s) => sum + s.absentDays, 0),
      totalLeave: summaries.reduce((sum, s) => sum + s.leaveDays, 0),
    }
  }, [summaries])

  const monthName = new Date(year, month - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600'
    if (percentage >= 75) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>{monthName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive mb-4">Error: {error}</div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : summaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance data available
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <StatCard
                  label="Average %"
                  value={stats.avgPercentage}
                  unit="%"
                  className={getPercentageColor(stats.avgPercentage)}
                />
                <StatCard
                  label="Total Present"
                  value={stats.totalPresent}
                  className="text-green-600"
                />
                <StatCard
                  label="Total Absent"
                  value={stats.totalAbsent}
                  className="text-red-600"
                />
                <StatCard
                  label="Total Leave"
                  value={stats.totalLeave}
                  className="text-orange-600"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-sm mb-3">Student Details</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {summaries.map((student) => (
                    <div key={student.studentId} className="text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{student.name}</span>
                        <Badge
                          variant={
                            student.percentage >= 85
                              ? 'default'
                              : student.percentage >= 75
                                ? 'secondary'
                                : 'destructive'
                          }
                          className="ml-2 flex-shrink-0"
                        >
                          {student.percentage}%
                        </Badge>
                      </div>
                      <Progress value={student.percentage} className="h-2" />
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>✓ {student.presentDays}</span>
                        <span>✗ {student.absentDays}</span>
                        <span>○ {student.leaveDays}</span>
                        <span>Total: {student.totalDays}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
