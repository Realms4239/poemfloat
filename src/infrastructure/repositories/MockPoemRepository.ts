import type { IPoemRepository } from '@/core/interfaces/IPoemRepository';
import type { Poem } from '@/core/domain/entities/Poem';

export class MockPoemRepository implements IPoemRepository {
  private poems: Poem[] = [
    {
      id: '1',
      title: 'art of letting go',
      slug: 'art-of-letting-go',
      symbol: '❃',
      content: [
        'spinning pulse of green',
        'rises from the mossy floor,',
        'where light forgets to stay.'
      ],
      theme: {
        primaryColor: '#e8f5e9',
        secondaryColor: '#2e7d32',
        turbulence: 0.3,
        particleType: 'dust'
      }
    },
    {
      id: '2',
      title: 'lovely color',
      slug: 'lovely-color',
      symbol: '✧',
      content: [
        'Unfolding breath',
        'on black velvet,',
        'the night exhales.'
      ],
      theme: {
        primaryColor: '#050505',
        secondaryColor: '#ffffff',
        turbulence: 0.1,
        particleType: 'dust'
      }
    },
    {
      id: '3',
      title: 'I used to know you',
      slug: 'i-used-to-know-you',
      symbol: '✦',
      content: [
        'A cat’s tail plaits',
        'through moonlight,',
        'silver on the tongue.'
      ],
      theme: {
        primaryColor: '#1a1a2e',
        secondaryColor: '#e0e0e0',
        turbulence: 0.8,
        particleType: 'leaf'
      }
    },
      {
        id: '4',
        title: 'unworried',
        slug: 'unworried',
        symbol: '❊',
        content: [
          'This is a quiet orbit of change',
          'and my way of transience.',
          'The morning is a pale glass.'
        ],
      theme: {
        primaryColor: '#fdfaf6',
        secondaryColor: '#1a1a1a',
        turbulence: 0.2,
        particleType: 'dust'
      }
    },
    {
      id: '5',
      title: 'her',
      slug: 'her',
      symbol: '✻',
      content: [
        'Soft light on the wall,',
        'shadows dance in silence,',
        'memories remain.'
      ],
      theme: {
        primaryColor: '#fff5f5',
        secondaryColor: '#ff8a80',
        turbulence: 0.4,
        particleType: 'dust'
      }
    },
    {
      id: '6',
      title: 'nightlight',
      slug: 'nightlight',
      symbol: '✽',
      content: [
        'A single spark',
        'in the vast dark,',
        'guiding the way home.'
      ],
      theme: {
        primaryColor: '#0a0a0a',
        secondaryColor: '#ffd54f',
        turbulence: 0.6,
        particleType: 'dust'
      }
    }
  ];

  async getAllPoems(): Promise<Poem[]> {
    return this.poems;
  }

  async getPoemBySlug(slug: string): Promise<Poem | null> {
    return this.poems.find(p => p.slug === slug) || null;
  }
}
