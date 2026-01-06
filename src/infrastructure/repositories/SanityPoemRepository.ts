import type { IPoemRepository } from '@/core/interfaces/IPoemRepository';
import type { Poem } from '@/core/domain/entities/Poem';

export class SanityPoemRepository implements IPoemRepository {
  private client: any;

  constructor() {
    this.client = useSanity();
  }

  async getAllPoems(): Promise<Poem[]> {
    const query = '*[_type == "poem"] { id, title, slug, content, theme, audioAmbienceUrl }';
    return await this.client.fetch(query);
  }

  async getPoemBySlug(slug: string): Promise<Poem | null> {
    const query = '*[_type == "poem" && slug.current == $slug][0]';
    return await this.client.fetch(query, { slug });
  }
}
