import { describe, it, expect } from 'vitest';
import { getExerciseImageUrl, EXERCISE_IMAGE_PLACEHOLDER } from '../../src/lib/exerciseImages';

describe('exerciseImages', () => {
  it('EXERCISE_IMAGE_PLACEHOLDER is a data URI', () => {
    expect(EXERCISE_IMAGE_PLACEHOLDER).toMatch(/^data:image\/svg\+xml,/);
  });

  it('getExerciseImageUrl returns placeholder for null exercise', () => {
    expect(getExerciseImageUrl(null)).toBe(EXERCISE_IMAGE_PLACEHOLDER);
  });

  it('getExerciseImageUrl returns placeholder for empty object', () => {
    const result = getExerciseImageUrl({});
    expect(result).toMatch(/^data:image\/svg\+xml,/);
  });

  it('getExerciseImageUrl returns placeholder for exercise without match', () => {
    const result = getExerciseImageUrl({ id: 'nonexistent-exercise-xyz' });
    expect(result).toMatch(/^data:image\/svg\+xml,/);
  });
});
