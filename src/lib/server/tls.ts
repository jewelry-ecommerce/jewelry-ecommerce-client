let isTlsConfigured = false;

/**
 * Relax Node TLS verification for backends with self-signed / private-CA certs.
 *
 * - Local `next dev` uses NODE_ENV=development; staging/dev often uses `next start` with NODE_ENV=production.
 * - The old check (NODE_ENV !== "production") meant ALLOW_SELF_SIGNED_TLS never applied on those servers.
 *
 * Set ALLOW_SELF_SIGNED_TLS=true only on internal dev/staging. Do not enable on public production.
 */
export const configureDevSelfSignedTls = () => {
  if (isTlsConfigured) return;

  if (process.env.ALLOW_SELF_SIGNED_TLS === "true") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  isTlsConfigured = true;
};
