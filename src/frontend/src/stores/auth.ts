import { defineStore } from 'pinia'

// PKCE utilities
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'https://oauth2.qa.comsatel.com.pe'
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'Apps'
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'miaplatform'
const REDIRECT_URI = 'http://localhost:5173/'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('mia_access_token') as string | null,
    refreshToken: localStorage.getItem('mia_refresh_token') as string | null,
    idToken: localStorage.getItem('mia_id_token') as string | null,
    user: null as Record<string, unknown> | null,
    avatarUrl: localStorage.getItem('mia_user_avatar_url') as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    authHeader: (state) => state.accessToken ? `Bearer ${state.accessToken}` : null,
  },
  actions: {
    async login() {
      const verifier = generateCodeVerifier()
      const challenge = await generateCodeChallenge(verifier)
      sessionStorage.setItem('pkce_verifier', verifier)

      const params = new URLSearchParams({
        client_id: KEYCLOAK_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'openid profile email',
        code_challenge: challenge,
        code_challenge_method: 'S256',
      })
      window.location.href = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?${params}`
    },

    async handleCallback(code: string): Promise<boolean> {
      const verifier = sessionStorage.getItem('pkce_verifier')
      if (!verifier) return false

      const response = await fetch(
        `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: KEYCLOAK_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            code,
            code_verifier: verifier,
          }),
        }
      )

      if (!response.ok) return false

      const tokens = await response.json()
      this.setTokens(tokens.access_token, tokens.refresh_token, tokens.id_token)
      sessionStorage.removeItem('pkce_verifier')
      return true
    },

    setTokens(access: string, refresh: string, id?: string) {
      this.accessToken = access
      this.refreshToken = refresh
      this.idToken = id || null
      localStorage.setItem('mia_access_token', access)
      localStorage.setItem('mia_refresh_token', refresh)
      if (id) localStorage.setItem('mia_id_token', id)
    },

    setAvatarUrl(url: string) {
      this.avatarUrl = url
      localStorage.setItem('mia_user_avatar_url', url)
    },

    async logout() {
      const idToken = this.idToken
      this.accessToken = null
      this.refreshToken = null
      this.idToken = null
      this.user = null
      this.avatarUrl = null
      localStorage.removeItem('mia_access_token')
      localStorage.removeItem('mia_refresh_token')
      localStorage.removeItem('mia_id_token')
      localStorage.removeItem('mia_user_avatar_url')

      const params = new URLSearchParams({
        client_id: KEYCLOAK_CLIENT_ID,
        post_logout_redirect_uri: REDIRECT_URI,
        ...(idToken ? { id_token_hint: idToken } : {}),
      })
      window.location.href = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout?${params}`
    },

    async refreshAccessToken(): Promise<boolean> {
      if (!this.refreshToken) {
        return false
      }

      try {
        const response = await fetch(
          `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: KEYCLOAK_CLIENT_ID,
              refresh_token: this.refreshToken,
            }),
          }
        )

        if (!response.ok) {
          // Refresh failed, logout user
          await this.logout()
          return false
        }

        const tokens = await response.json()
        this.setTokens(tokens.access_token, tokens.refresh_token || this.refreshToken, tokens.id_token)
        return true
      } catch (error) {
        console.error('Token refresh failed:', error)
        return false
      }
    },
  },
})
