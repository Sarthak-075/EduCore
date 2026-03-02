import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BatchForm } from './BatchForm'
import '@testing-library/jest-dom'

describe('BatchForm', () => {
  it('renders form with empty inputs for new batch', () => {
    const mockOnSubmit = jest.fn()
    render(<BatchForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('heading')).toHaveTextContent('Create New Batch')
    expect(screen.getByPlaceholderText(/Batch name/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /Create Batch/i })).toBeInTheDocument()
  })

  it('renders form with populated inputs for edit batch', () => {
    const mockOnSubmit = jest.fn()
    const batch = {
      id: '1',
      teacherId: 'teacher1',
      name: 'Class 10-A',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }

    render(<BatchForm batch={batch} onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('heading')).toHaveTextContent('Edit Batch')
    expect(screen.getByPlaceholderText(/Batch name/i)).toHaveValue('Class 10-A')
    expect(screen.getByRole('button', { name: /Update Batch/i })).toBeInTheDocument()
  })

  it('submits form with valid batch name', async () => {
    const mockOnSubmit = jest.fn()
    render(<BatchForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText(/Batch name/i)
    const button = screen.getByRole('button', { name: /Create Batch/i })

    fireEvent.change(input, { target: { value: 'New Batch' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('New Batch')
    })
  })

  it('shows validation error for empty name', async () => {
    const mockOnSubmit = jest.fn()
    render(<BatchForm onSubmit={mockOnSubmit} />)

    const button = screen.getByRole('button', { name: /Create Batch/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Batch name is required/i)).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('shows validation error for name too short', async () => {
    const mockOnSubmit = jest.fn()
    render(<BatchForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText(/Batch name/i)
    const button = screen.getByRole('button', { name: /Create Batch/i })

    fireEvent.change(input, { target: { value: 'A' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(
        screen.getByText(/Batch name must be at least 2 characters/i)
      ).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('shows error message when provided', () => {
    const mockOnSubmit = jest.fn()
    render(
      <BatchForm
        onSubmit={mockOnSubmit}
        error="Failed to create batch"
      />
    )

    expect(screen.getByText(/Failed to create batch/i)).toBeInTheDocument()
  })

  it('disables form when isLoading is true', () => {
    const mockOnSubmit = jest.fn()
    render(<BatchForm onSubmit={mockOnSubmit} isLoading={true} />)

    expect(screen.getByPlaceholderText(/Batch name/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnSubmit = jest.fn()
    const mockOnCancel = jest.fn()
    render(
      <BatchForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })
})
