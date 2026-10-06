import "server-only";

/**
 * Optional bot-challenge verification (e.g. Cloudflare Turnstile, hCaptcha).
 * Release 1a ships with the honeypot and rate limits only; this adapter is the
 * single place to add a provider later without touching the route handlers.
 */
export interface ChallengeVerifier {
  verify(token: string | undefined, clientAddress: string): Promise<boolean>;
}

export const noChallenge: ChallengeVerifier = {
  async verify() {
    return true;
  },
};

export function getChallengeVerifier(): ChallengeVerifier {
  return noChallenge;
}
