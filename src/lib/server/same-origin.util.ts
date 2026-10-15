export function isSameOriginRequest(origin: string | null, host: string | null, protocol: string): boolean {
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    return parsed.origin === origin && parsed.protocol === protocol && parsed.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}
