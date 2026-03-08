import { describe, it, expect } from 'vitest';
import {
  searchExerciseDb,
  getUniquePrimaryMuscles,
  getApiExerciseImageUrl,
  getApiImageUrlFromPath,
} from '../../src/lib/exerciseDbApi';

const SAMPLE_LIST = [
  { id: '1', name: 'Push Up', primaryMuscles: ['Chest'], images: ['push-up/0.jpg'] },
  { id: '2', name: 'Pull Up', primaryMuscles: ['Back'], images: [] },
  { id: '3', name: 'Squat', primaryMuscles: ['Quadriceps'], images: ['squat/0.jpg'] },
  { id: '4', name: 'Bench Press', primaryMuscles: ['Chest'], images: ['bench/0.jpg'] },
];

describe('searchExerciseDb', () => {
  it('returns all when query and muscle are empty', () => {
    const result = searchExerciseDb(SAMPLE_LIST, '', '');
    expect(result).toHaveLength(4);
  });

  it('filters by name (case-insensitive)', () => {
    const result = searchExerciseDb(SAMPLE_LIST, 'push');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Push Up');
  });

  it('filters by primary muscle', () => {
    const result = searchExerciseDb(SAMPLE_LIST, '', 'chest');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toContain('Push Up');
    expect(result.map((r) => r.name)).toContain('Bench Press');
  });

  it('filters by both name and muscle', () => {
    const result = searchExerciseDb(SAMPLE_LIST, 'up', 'chest');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Push Up');
  });

  it('returns empty array for empty list', () => {
    expect(searchExerciseDb([], 'push', '')).toHaveLength(0);
  });

  it('returns empty array for null list', () => {
    expect(searchExerciseDb(null, 'push', '')).toHaveLength(0);
  });
});

describe('getUniquePrimaryMuscles', () => {
  it('returns sorted unique muscles', () => {
    const result = getUniquePrimaryMuscles(SAMPLE_LIST);
    expect(result).toEqual(['Back', 'Chest', 'Quadriceps']);
  });

  it('returns empty array for empty list', () => {
    expect(getUniquePrimaryMuscles([])).toEqual([]);
  });

  it('returns empty array for null list', () => {
    expect(getUniquePrimaryMuscles(null)).toEqual([]);
  });
});

describe('getApiExerciseImageUrl', () => {
  it('returns image URL when exercise has images', () => {
    const url = getApiExerciseImageUrl(SAMPLE_LIST[0]);
    expect(url).toContain('push-up');
    expect(url).toContain('0.jpg');
  });

  it('returns null when exercise has no images', () => {
    expect(getApiExerciseImageUrl(SAMPLE_LIST[1])).toBeNull();
  });

  it('returns null for null exercise', () => {
    expect(getApiExerciseImageUrl(null)).toBeNull();
  });

  it('returns null for exercise with empty images', () => {
    expect(getApiExerciseImageUrl({ id: 'x', name: 'X', images: [] })).toBeNull();
  });
});

describe('getApiImageUrlFromPath', () => {
  it('returns full URL for path', () => {
    const url = getApiImageUrlFromPath('some/path/0.jpg');
    expect(url).toContain('some/path/0.jpg');
  });

  it('returns null for null path', () => {
    expect(getApiImageUrlFromPath(null)).toBeNull();
  });

  it('returns null for empty path', () => {
    expect(getApiImageUrlFromPath('')).toBeNull();
  });
});
