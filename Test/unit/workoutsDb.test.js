import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadWorkouts, saveWorkouts } from '../../src/lib/workoutsDb';

vi.mock('../../src/lib/firebase', () => ({
  db: null,
  isFirebaseEnabled: () => false,
}));

describe('workoutsDb (unit)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadWorkouts', () => {
    it('returns empty array when localStorage is empty', async () => {
      const result = await loadWorkouts(null);
      expect(result).toEqual([]);
    });

    it('returns parsed workouts from localStorage when userId is null', async () => {
      const workouts = [{ id: 1, name: 'Leg Day', exercises: [] }];
      localStorage.setItem('workouts', JSON.stringify(workouts));
      const result = await loadWorkouts(null);
      expect(result).toEqual(workouts);
    });

    it('returns parsed workouts from localStorage when Firebase disabled', async () => {
      const workouts = [{ id: 2, name: 'Upper Body' }];
      localStorage.setItem('workouts', JSON.stringify(workouts));
      const result = await loadWorkouts('some-user-id');
      expect(result).toEqual(workouts);
    });
  });

  describe('saveWorkouts', () => {
    it('saves workouts to localStorage when userId is null', async () => {
      const workouts = [{ id: 1, name: 'Test' }];
      await saveWorkouts(workouts, null);
      const raw = localStorage.getItem('workouts');
      expect(JSON.parse(raw)).toEqual(workouts);
    });

    it('saves workouts to localStorage when Firebase disabled', async () => {
      const workouts = [{ id: 2, name: 'Cardio' }];
      await saveWorkouts(workouts, 'user-123');
      const raw = localStorage.getItem('workouts');
      expect(JSON.parse(raw)).toEqual(workouts);
    });
  });
});
