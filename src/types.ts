export type CandleShape = 'classic' | 'twisted' | 'heart' | 'star' | 'slim' | 'chunky';
export type CandleColorName = 'white' | 'cream' | 'blue' | 'pink' | 'yellow' | 'green' | 'purple';
export type CandlePattern = 'plain' | 'stripes' | 'dots';
export type FlameStyle = 'normal' | 'small' | 'sparkle';

export const CANDLE_COLORS: Record<CandleColorName, string> = {
  white: '#F7F4EE',
  cream: '#EFDFC2',
  blue: '#6E8CAE',
  pink: '#E5A9B4',
  yellow: '#E8C468',
  green: '#8CA888',
  purple: '#A48CBF',
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
  finalMessage: FinalMessage;
}

export const DEFAULT_CANDLE_DESIGN: CandleDesign = {
  shape: 'classic',
  color: 'cream',
  pattern: 'plain',
  flame: 'normal',
};
