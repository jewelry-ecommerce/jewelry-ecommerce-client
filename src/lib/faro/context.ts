export type FaroSessionContextInput = {
  tenantCode?: string | null;
  anonymousId?: string | null;
};

/** Graduation project: observability is intentionally disabled. */
export function applyFaroSessionContext(_input: FaroSessionContextInput): void {}
