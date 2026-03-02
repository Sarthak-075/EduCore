import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AttendanceMarkSheet, StudentAttendanceRecord } from '../AttendanceMarkSheet'
import '@testing-library/jest-dom'

describe('AttendanceMarkSheet', () => {
  const mockStudents: StudentAttendanceRecord[] = [
    {
      studentId: '1',
      name: 'John Doe',
      status: null,
      remarks: '',
    },
    {
      studentId: '2',
      name: 'Jane Smith',
      status: null,
      remarks: '',
    },
    {
      studentId: '3',
      name: 'Bob Johnson',
      status: null,
      remarks: '',
    },
  ]

  const mockOnRecordChange = jest.fn()
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders attendance mark sheet', () => {
    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={mockStudents}
        onRecordChange={mockOnRecordChange}
      />
    )

    expect(screen.getByText(/Mark Attendance/i)).toBeInTheDocument()
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument()
    expect(screen.getByText(/Bob Johnson/i)).toBeInTheDocument()
  })

  it('shows correct date format', () => {
    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={mockStudents}
        onRecordChange={mockOnRecordChange}
      />
    )

    expect(screen.getByText(/Monday, January 15, 2024/i)).toBeInTheDocument()
  })

  it('displays marked count', () => {
    const studentsWithStatus = [
      { ...mockStudents[0], status: 'PRESENT' as const },
      mockStudents[1],
      mockStudents[2],
    ]

    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={studentsWithStatus}
        onRecordChange={mockOnRecordChange}
      />
    )

    expect(screen.getByText(/Marked:.*1\/3/)).toBeInTheDocument()
  })

  it('calls onRecordChange when attendance status is selected', async () => {
    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={mockStudents}
        onRecordChange={mockOnRecordChange}
      />
    )

    const presentButtons = screen.getAllByText('✓ Present')
    fireEvent.click(presentButtons[0])

    await waitFor(() => {
      expect(mockOnRecordChange).toHaveBeenCalledWith('1', 'PRESENT')
    })
  })

  it('filters students by search query', () => {
    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={mockStudents}
        onRecordChange={mockOnRecordChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/Search student name/i)
    fireEvent.change(searchInput, { target: { value: 'John' } })

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
    expect(screen.queryByText(/Jane Smith/i)).not.toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={mockStudents}
        onRecordChange={mockOnRecordChange}
        isLoading={true}
      />
    )

    expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled()
  })

  it('calls onSubmit when submit button is clicked', async () => {
    const studentsWithStatus = [
      { ...mockStudents[0], status: 'PRESENT' as const },
      { ...mockStudents[1], status: 'ABSENT' as const },
      ...mockStudents.slice(2),
    ]

    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={studentsWithStatus}
        onRecordChange={mockOnRecordChange}
        onSubmit={mockOnSubmit}
      />
    )

    const submitButton = screen.getByRole('button', { name: /Submit/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it('disables submit button when no students are marked', () => {
    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={mockStudents}
        onRecordChange={mockOnRecordChange}
        onSubmit={mockOnSubmit}
      />
    )

    const submitButton = screen.getByRole('button', { name: /Submit/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when at least one student is marked', () => {
    const studentsWithStatus = [
      { ...mockStudents[0], status: 'PRESENT' as const },
      ...mockStudents.slice(1),
    ]

    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={studentsWithStatus}
        onRecordChange={mockOnRecordChange}
        onSubmit={mockOnSubmit}
      />
    )

    const submitButton = screen.getByRole('button', { name: /Submit/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('calls onBulkMark when bulk mark button is clicked', async () => {
    const mockOnBulkMark = jest.fn()

    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={mockStudents}
        onRecordChange={mockOnRecordChange}
        bulkMarkAllowed={true}
        onBulkMark={mockOnBulkMark}
      />
    )

    const markAllButtons = screen.getAllByText(/Mark All/i)
    fireEvent.click(markAllButtons[0])

    expect(mockOnBulkMark).toHaveBeenCalledWith('PRESENT')
  })

  it('shows error message when provided', () => {
    render(
      <AttendanceMarkSheet
        date="2024-01-15"
        students={mockStudents}
        onRecordChange={mockOnRecordChange}
        error="Failed to load attendance"
      />
    )

    expect(screen.getByText(/Failed to load attendance/i)).toBeInTheDocument()
  })
})
