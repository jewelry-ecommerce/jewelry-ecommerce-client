export type FaroContextAttributes = Record<string, string | number | boolean | null | undefined>;
export type FaroErrorOptions = Record<string, unknown>;

export type FaroUserIdentity = {
  id: string;
  username?: string;
  attributes?: FaroContextAttributes;
};

/** Graduation project: observability is intentionally disabled. */
export function safePushLog(_message: string, _context?: FaroContextAttributes): void {}

/** Graduation project: observability is intentionally disabled. */
export function safePushError(_error: unknown, _context?: FaroContextAttributes, _options?: FaroErrorOptions): void {}

/** Graduation project: observability is intentionally disabled. */
export function safePushEvent(_name: string, _attributes?: FaroContextAttributes): void {}

/** Graduation project: observability is intentionally disabled. */
export function safeSetUser(_user: FaroUserIdentity | undefined): void {}
