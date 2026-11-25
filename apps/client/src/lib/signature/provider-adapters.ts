export type ExternalProviderName =
  | 'icp_brasil_provider'
  | 'govbr_provider'
  | 'timestamp_provider';

export interface ProviderVerificationResult {
  provider: ExternalProviderName;
  verified: boolean;
  timestampToken?: string;
  certificateSubject?: string;
  reason?: string;
}

/**
 * Adapter interface for external ICP-Brasil, Gov.br, and TSA providers (Section 23.12).
 * Never simulates ICP-Brasil or undocumented Gov.br APIs.
 */
export async function verifyWithExternalProvider(
  provider: ExternalProviderName,
  documentHash: string
): Promise<ProviderVerificationResult> {
  const isConfigured =
    (provider === 'icp_brasil_provider' && Boolean(process.env.ICP_BRASIL_PROVIDER_URL)) ||
    (provider === 'govbr_provider' && Boolean(process.env.GOVBR_OAUTH_CLIENT_ID)) ||
    (provider === 'timestamp_provider' && Boolean(process.env.TSA_PROVIDER_URL));

  if (!isConfigured) {
    return {
      provider,
      verified: false,
      reason: `Provedor ${provider} não configurado neste ambiente.`,
    };
  }

  return {
    provider,
    verified: false,
    reason: `Integração ${provider} pronta para chamada homologada (hash: ${documentHash.slice(0, 12)}...).`,
  };
}
