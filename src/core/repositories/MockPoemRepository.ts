import type { Poem } from '../domain/entities/Poem';
import type { IPoemRepository } from './IPoemRepository';

export class MockPoemRepository implements IPoemRepository {
  private poems: Poem[] = [
    {
      id: '1',
      title: 'art of letting go',
      slug: 'art-of-letting-go',
      content: [
        'It is a painful art,',
        'Of which wisdom is a must.',
        'Our struggle implores its embrace,',
        'Our growth entails its acceptance.'
      ],
      theme: {
        primaryColor: '#fdfaf6',
        secondaryColor: '#e8f5e9',
        turbulence: 0.5,
        particleType: 'leaf'
      }
    },
    {
      id: '2',
      title: 'lovely color',
      slug: 'lovely-color',
      content: [
        'Love has no color—',
        'Yet how vividly yours stains me',
        'a shade of mess,',
        'with each sweet breathe.',
        'Too much to bear,',
        'too real to deny.'
      ],
      theme: {
        primaryColor: '#fdfaf6',
        secondaryColor: '#fff0f0',
        turbulence: 0.3,
        particleType: 'dust'
      }
    },
    {
      id: '3',
      title: 'I used to know you',
      slug: 'i-used-to-know-you',
      content: [
        'I wish I still could.',
        'But you’ve changed,',
        'and that’s okay.',
        '',
        'I hope that',
        'those who are lucky enough',
        'to know you now',
        '',
        'Love you like I did then.'
      ],
      theme: {
        primaryColor: '#f5f1e9',
        secondaryColor: '#fdfaf6',
        turbulence: 0.2,
        particleType: 'firefly'
      }
    },
    {
      id: '4',
      title: 'unworried',
      slug: 'unworried',
      content: [
        'She played today,',
        'with naught a',
        'care to weigh.',
        'Her fur so soft',
        'Her tail so plait.',
        '',
        'As to anything else,',
        'She hasn’t had a single thought',
        'Of letting go a pain',
        'that is beyond words to take.',
        'Of staying in the moment',
        'when it’s always slipping away.',
        'For she always bite nearby thoughts',
        'gracefully.',
        '',
        'How would it be to be Iris,',
        'I wonder,',
        'not pondering the world',
        'with questions that',
        '    cannot be answered',
        '          and would never be.',
        '',
        'And so, she lies on my lap',
        'Unworried in the shade',
        'Her purrs a peaceful lullaby',
        '',
        'Tell me you love me,',
        'those deep eyes said.',
        '',
        'I wear my sweetest smile,',
        'my heart dresses in green',
        '      and dances.'
      ],
      theme: {
        primaryColor: '#e8f5e9',
        secondaryColor: '#fdfaf6',
        turbulence: 0.4,
        particleType: 'frog_icon'
      }
    },
    {
      id: '5',
      title: 'her',
      slug: 'her',
      content: [
        'The song has ended,',
        'but the melody remains,',
        '',
        'as I sigh',
        'and gaze at her smile.',
        '',
        'For it is her laughter I cherish,',
        'My favorite song,',
        '',
        'which I shall never cease to hear.'
      ],
      theme: {
        primaryColor: '#fff0f0',
        secondaryColor: '#fdfaf6',
        turbulence: 0.2,
        particleType: 'leaf'
      }
    },
    {
      id: '6',
      title: 'nightlight',
      slug: 'nightlight',
      content: [
        'I’ve had a chance to go down a lonely road.',
        'Now I know I don’t wanna go no more.',
        '',
        'I see your pain, I see all our old times,',
        'And I don’t wanna miss them,',
        'but I keep reminiscing—',
        'I see our home in a vision,',
        'Something to believe in.',
        '',
        'powerless.',
        'Trying something new every day.',
        'I am powerless.',
        '',
        'Throw me to the flames of my other self,',
        'Watch me unload insecurities and offensive vices.',
        'Watch me distort your image of me.',
        'Watch how frail I am.',
        'Watch me burn.',
        '',
        'the more intimate I get, the lower I sink.',
        'Though I’m scared to get close',
        'and hating being alone.',
        '',
        'You made that big smile, as if nothing’s wrong.',
        'You smiled through my soul,',
        'and I’ve never felt so much warmth for your kindness.',
        '',
        'Maybe you saved me, or maybe I’m drifting nowhere.',
        'Maybe it made me realize how hard it is',
        'to truly change.',
        'Even hell can feel like home once you’ve settled in.',
        '',
        'The funny thing is, all I ever wanted I already had.',
        'I just had to start again.',
        '',
        'You held my hand tightly, as if it were',
        'the most precious thing to cling onto.',
        'I held you so proudly.',
        '',
        'There are glimpses of heaven in those small moments,',
        'And it’s comforting',
        'to know that',
        'I’m feeling less alone.'
      ],
      theme: {
        primaryColor: '#0f0f0f',
        secondaryColor: '#1a1a2e',
        turbulence: 0.6,
        particleType: 'dust'
      }
    }
  ];

  async getAllPoems(): Promise<Poem[]> {
    return this.poems;
  }

  async getPoemBySlug(slug: string): Promise<Poem> {
    const poem = this.poems.find(p => p.slug === slug);
    if (!poem) throw new Error(`Poem not found: ${slug}`);
    return poem;
  }
}
