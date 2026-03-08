import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExercisePicker from '../../src/components/ExercisePicker';

vi.mock('../../src/lib/exerciseDbApi', () => ({
  fetchExerciseDb: () => Promise.resolve([
    { id: '1', name: 'Push Up', primaryMuscles: ['Chest'] },
    { id: '2', name: 'Squat', primaryMuscles: ['Quadriceps'] },
  ]),
  searchExerciseDb: (list, q) => {
    if (!q) return list;
    return list.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));
  },
  getUniquePrimaryMuscles: (list) =>
    [...new Set(list.flatMap((e) => e.primaryMuscles || []))].sort(),
  getApiExerciseImageUrl: () => null,
}));

describe('ExercisePicker', () => {
  const onSelect = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    onSelect.mockClear();
    onCancel.mockClear();
  });

  it('renders and fetches exercise list', async () => {
    render(<ExercisePicker onSelect={onSelect} onCancel={onCancel} />);
    await vi.waitFor(() => {
      expect(screen.getByText('Push Up')).toBeInTheDocument();
    });
    expect(screen.getByText('Squat')).toBeInTheDocument();
  });

  it('calls onCancel when overlay clicked', async () => {
    render(<ExercisePicker onSelect={onSelect} onCancel={onCancel} />);
    await vi.waitFor(() => expect(screen.getByText('Push Up')).toBeInTheDocument());
    const overlay = document.querySelector('.exercise-picker-overlay');
    if (overlay) await userEvent.click(overlay);
    expect(onCancel).toHaveBeenCalled();
  });

  it('has custom exercise tab', async () => {
    render(<ExercisePicker onSelect={onSelect} onCancel={onCancel} />);
    await vi.waitFor(() => expect(screen.getByText('Push Up')).toBeInTheDocument());
    const customTab = screen.queryByText(/custom/i);
    expect(customTab).toBeTruthy();
  });
});
