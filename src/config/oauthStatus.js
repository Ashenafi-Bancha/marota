const asBoolean = (value) => String(value || "").toLowerCase() === "true";

const oauthProviderLabels = {
  google: "Google",
  facebook: "Facebook",
  github: "GitHub",
  linkedin_oidc: "LinkedIn",
};

const oauthProviderFlags = {
  google: asBoolean(import.meta.env.VITE_OAUTH_GOOGLE_ENABLED),
  facebook: asBoolean(import.meta.env.VITE_OAUTH_FACEBOOK_ENABLED),
  github: asBoolean(import.meta.env.VITE_OAUTH_GITHUB_ENABLED),
  linkedin_oidc: asBoolean(import.meta.env.VITE_OAUTH_LINKEDIN_ENABLED),
};

export const isOAuthProviderConfigured = (provider) => {
  if (!(provider in oauthProviderFlags)) {
    return true;
  }

  return oauthProviderFlags[provider];
};

export const getOAuthNotConfiguredMessage = (provider) => {
  const providerLabel = oauthProviderLabels[provider] || "This provider";
  return `${providerLabel} sign-in is not configured yet. The developer is fixing and configuring it now. Please try again soon.`;
};
