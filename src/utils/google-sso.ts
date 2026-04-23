export const APP_AUTH_SESSION_RETURN_URL = 'com.guidemichelin.front://'

const TOKEN_QUERY_KEYS = ['jwt', 'token', 'access_token'] as const

function readTokenFromParams(rawParams: string): string | null {
  const params = new URLSearchParams(rawParams)

  for (const key of TOKEN_QUERY_KEYS) {
    const value = params.get(key)
    if (value) {
      return value
    }
  }

  return null
}

export function extractJwtFromAuthCallbackUrl(url: string): string | null {
  const queryStart = url.indexOf('?')
  if (queryStart !== -1) {
    const hashStart = url.indexOf('#', queryStart)
    const queryPart = url.slice(queryStart + 1, hashStart === -1 ? undefined : hashStart)
    const tokenFromQuery = readTokenFromParams(queryPart)
    if (tokenFromQuery) {
      return tokenFromQuery
    }
  }

  const hashStart = url.indexOf('#')
  if (hashStart !== -1) {
    const hashPart = url.slice(hashStart + 1)
    return readTokenFromParams(hashPart)
  }

  return null
}

export function buildGoogleSsoUrl(
  apiHost: string | undefined,
): string | null {
  if (!apiHost) {
    return null
  }

  const normalizedApiHost = apiHost.replace(/\/+$/, '')

  return `${normalizedApiHost}/api/v1/auth/google?platform=MOBILE`
}
