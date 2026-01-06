import type { AtmosphericTheme } from '../value-objects/AtmosphericTheme';

export interface Poem {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly content: string[];
  readonly symbol?: string;
  readonly theme: AtmosphericTheme;
  readonly audioAmbienceUrl?: string;
}
