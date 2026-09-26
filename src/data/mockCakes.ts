import type { BirthdayCake } from '../types';

export const MOCK_CAKES: Record<string, BirthdayCake> = {
  maria: {
    slug: 'maria',
    recipientName: 'Maria',
    cakeTitle: 'Happy Birthday, Maria',
    finalMessage: {
      sender: 'Josh',
      message:
        "I wanted this cake to hold everyone who loves you, but I made sure I'd be the last candle. Twenty-nine years in and you're still the best part of every single one of them. Here's to the next year — I love you more than any of these messages can say.",
      candle: { shape: 'heart', color: 'pink', pattern: 'plain', flame: 'sparkle' },
    },
    messages: [
      {
        id: 'm1',
        sender: 'Alex',
        message:
          "Happy birthday!! I hope you have an amazing year ahead. Thanks for always being there, even at 2am when I needed to talk something through.",
        candle: { shape: 'twisted', color: 'blue', pattern: 'stripes', flame: 'sparkle' },
        read: false,
        createdAt: '2026-09-20T14:12:00Z',
      },
      {
        id: 'm2',
        sender: 'Priya',
        message:
          "Maria! Another year of you being effortlessly the most put-together person I know. Can't wait for our trip next month — save room in your suitcase for my snacks.",
        candle: { shape: 'heart', color: 'pink', pattern: 'dots', flame: 'normal' },
        read: false,
        createdAt: '2026-09-20T16:03:00Z',
      },
      {
        id: 'm3',
        sender: 'Daniel',
        message:
          "Cheers to you, Maria. Grateful for every ridiculous group chat you've kept alive single-handedly. Hope this year brings you exactly what you're chasing.",
        candle: { shape: 'classic', color: 'cream', pattern: 'stripes', flame: 'normal' },
        read: true,
        createdAt: '2026-09-19T09:44:00Z',
      },
      {
        id: 'm4',
        sender: 'Sam',
        message:
          'Happy birthday! You once talked me out of quitting my job in a parking lot at midnight and I still think about it. Thank you for being exactly who you are.',
        candle: { shape: 'star', color: 'yellow', pattern: 'plain', flame: 'sparkle' },
        read: false,
        createdAt: '2026-09-21T08:15:00Z',
      },
      {
        id: 'm5',
        sender: 'Grandma Elsie',
        message:
          "My darling girl, another year older and still my favorite person to brag about. Come visit soon, I miss your laugh in this house.",
        candle: { shape: 'slim', color: 'white', pattern: 'plain', flame: 'small' },
        read: false,
        createdAt: '2026-09-18T20:30:00Z',
      },
      {
        id: 'm6',
        sender: 'Ben',
        message:
          "Happy birthday, Maria! Thanks for reading my terrible first drafts and telling me the truth anyway. This year I owe you a very good dinner.",
        candle: { shape: 'chunky', color: 'green', pattern: 'dots', flame: 'normal' },
        read: false,
        createdAt: '2026-09-21T11:52:00Z',
      },
      {
        id: 'm7',
        sender: 'Noor',
        message:
          "To the person who remembers everyone's coffee order — happy birthday. You make ordinary days feel like they matter. Love you lots.",
        candle: { shape: 'twisted', color: 'purple', pattern: 'stripes', flame: 'sparkle' },
        read: true,
        createdAt: '2026-09-17T13:00:00Z',
      },
      {
        id: 'm8',
        sender: 'Theo',
        message:
          "Happy birthday! Still can't beat you at chess, still trying. Hope your year is full of good books and better weather than this one.",
        candle: { shape: 'classic', color: 'blue', pattern: 'plain', flame: 'normal' },
        read: false,
        createdAt: '2026-09-22T07:20:00Z',
      },
      {
        id: 'm9',
        sender: 'Lena',
        message:
          "Maria — happy birthday to my favorite person to overanalyze a group text with. So lucky to know you. Here's to another year of us.",
        candle: { shape: 'heart', color: 'pink', pattern: 'plain', flame: 'small' },
        read: false,
        createdAt: '2026-09-22T09:05:00Z',
      },
    ],
  },
};

export function getMockCake(slug: string): BirthdayCake | undefined {
  return MOCK_CAKES[slug];
}
