import { describe, it, expect } from 'vitest';
import { API } from '../../src/api';

describe('api (unit)', () => {
  it('exports API constant', () => {
    expect(API).toBeDefined();
    expect(typeof API).toBe('string');
  });

  it('API is a valid URL', () => {
    expect(API).toMatch(/^https?:\/\//);
  });
});
