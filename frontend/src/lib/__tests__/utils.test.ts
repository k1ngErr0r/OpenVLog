import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names and filters falsy', () => {
    expect(cn('a', false && 'b', 'c', null as any, undefined as any)).toBe('a c');
  });
});
