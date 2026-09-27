export type CandleShape = 'classic' | 'twisted' | 'heart' | 'star' | 'slim' | 'chunky';
// 'gold' and 'black' are exclusive — reserved for the admin's final candle,
// never offered on the public sender-facing form.
export type CandleColorName = 'white' | 'cream' | 'blue' | 'pink' | 'yellow' | 'green' | 'purple' | 'red' | 'teal' | 'gold' | 'black';
export type CandlePattern = 'plain' | 'stripes' | 'dots' | 'glitter';
// 'firework', 'rainbow' and 'confetti' are exclusive — same reasoning as above.
export type FlameStyle = 'normal' | 'small' | 'sparkle' | 'steady' | 'firework' | 'rainbow' | 'confetti';

export const CANDLE_COLORS: Record<CandleColorName, string> = {
  white: '#F7F4EE',
  cream: '#EFDFC2',
  blue: '#6E8CAE',
  pink: '#E5A9B4',
  yellow: '#E8C468',
  green: '#8CA888',
  purple: '#A48CBF',
  red: '#C4574F',
  teal: '#3E9E96',
  gold: '#D4AF37',
  black: '#2A2724',
};

export interface CandleDesign {
  shape: CandleShape;
  color: CandleColorName;
  pattern: CandlePattern;
  flame: FlameStyle;
}


export interface CandleMessage {
  id: string;
  sender: string;
  message: string;
  candle: CandleDesign;
  read: boolean;
  createdAt: string; // ISO timestamp
}

export interface FinalMessage {
  sender: string;
  message: string;
  candle: CandleDesign;
}

export interface BirthdayCake {
  slug: string;
  recipientName: string;
  cakeTitle: string;
  messages: CandleMessage[];
  // null until fetchFinalMessage() has actually been called — kept out of
  // the initial fetch so it never reaches the browser before it's unlocked.
  finalMessage: FinalMessage | null;
}

export const DEFAULT_CANDLE_DESIGN: CandleDesign = {
  shape: 'classic',
  color: 'cream',
  pattern: 'plain',
  flame: 'normal',
};
