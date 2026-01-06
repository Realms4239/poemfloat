import type { Poem } from '../domain/entities/Poem';

export interface IPoemRepository {
  getAllPoems(): Promise<Poem[]>;
  getPoemBySlug(slug: string): Promise<Poem | null>;
}
