import { describe, it, expect } from 'vitest';
import { validateScore } from '../utils/validation';

describe('validateScore', () => {
  // Valid scores
  it('accepts score of 1 with 1 HP', () => {
    expect(validateScore(1, 1)).toBe(true);
  });

  it('accepts score of 15 with 15 HP', () => {
    expect(validateScore(15, 15)).toBe(true);
  });

  it('accepts score of 20 with 20 HP', () => {
    expect(validateScore(20, 20)).toBe(true);
  });

  it('accepts score of 25 with 20 HP (potion bonus)', () => {
    expect(validateScore(25, 20)).toBe(true);
  });

  it('accepts max score of 30 with 20 HP (10 potion bonus)', () => {
    expect(validateScore(30, 20)).toBe(true);
  });

  // Invalid scores - out of bounds
  it('rejects score of 0', () => {
    expect(validateScore(0, 1)).toBe(false);
  });

  it('rejects negative score', () => {
    expect(validateScore(-5, 1)).toBe(false);
  });

  it('rejects score above 30', () => {
    expect(validateScore(31, 20)).toBe(false);
  });

  // Invalid HP
  it('rejects HP of 0', () => {
    expect(validateScore(1, 0)).toBe(false);
  });

  it('rejects HP above 20', () => {
    expect(validateScore(21, 21)).toBe(false);
  });

  // Invalid score-HP relationships
  it('rejects score less than HP', () => {
    expect(validateScore(5, 10)).toBe(false);
  });

  it('rejects potion bonus when HP is not 20', () => {
    expect(validateScore(25, 19)).toBe(false);
  });

  it('rejects potion bonus greater than 10', () => {
    expect(validateScore(31, 20)).toBe(false);
  });

  // Non-integer values
  it('rejects float score', () => {
    expect(validateScore(5.5, 5)).toBe(false);
  });

  it('rejects float HP', () => {
    expect(validateScore(5, 5.5)).toBe(false);
  });
});
