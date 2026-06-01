import { createClient } from '@supabase/supabase-js'

const RAW_SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || ''

// Normalize the Supabase URL: user may accidentally paste a URL with a path like /rest/v1
let SUPABASE_URL = RAW_SUPABASE_URL
try {
  if (RAW_SUPABASE_URL) {
    const parsed = new URL(RAW_SUPABASE_URL)
    SUPABASE_URL = parsed.origin
    if (parsed.pathname && parsed.pathname !== '/') {
      // eslint-disable-next-line no-console
      console.warn(
        `VITE_SUPABASE_URL contains a path (${parsed.pathname}). Using base origin ${SUPABASE_URL} instead.`
      )
    }
  }
} catch {
  SUPABASE_URL = RAW_SUPABASE_URL
}

const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

let supabase: any
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
} else {
  // eslint-disable-next-line no-console
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set — using stub supabase client')
  supabase = {
    auth: {
      signUp: async () => ({ error: { message: 'Supabase not configured' } }),
      signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
      signIn: async () => ({ error: { message: 'Supabase not configured' } }),
      signOut: async () => ({}),
      getUser: async () => ({ data: { user: null } }),
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (_: string) => ({
      insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
      select: async () => ({ data: null, error: new Error('Supabase not configured') }),
      update: async () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: async () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
  }
}

export type SignUpPayload = {
  email: string
  password: string
  name?: string
  phone?: string
  role?: 'Owner' | 'Customer' | 'Admin'
}

export async function signUp(payload: SignUpPayload) {
  const { email, password, name, phone, role } = payload

  // IMPORTANT:
  // - supabase-js v2 uses a single-argument signUp({ email, password, options })
  // - metadata should match your DB trigger: full_name, phone, role
  const res = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name ?? null,
        phone: phone ?? null,
        role: role ?? 'Customer',
      },
    },
  })

  return res
}

export async function signIn(email: string, password: string) {
  const auth: any = supabase.auth
  if (typeof auth.signInWithPassword === 'function') {
    return await auth.signInWithPassword({ email, password })
  }
  return await auth.signIn({ email, password })
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export function getUser() {
  return supabase.auth.getUser()
}

export type OwnerRecord = {
  id?: string | number
  name: string
  number: string
  address: string
  password: string
}

const OWNER_SESSION_KEY = 'basai_owner_session'

export async function registerOwner(payload: OwnerRecord) {
  const { data, error } = await supabase.from('owners').insert([payload]).select()
  if (error) {
    const message =
      typeof error.message === 'string' && error.message.toLowerCase().includes('row-level security')
        ? 'Owner registration is blocked by your Supabase RLS policy. Allow INSERT on the owners table to continue.'
        : error.message
    return { data: null, error: { ...error, message } }
  }

  if (!error) {
    const owner = Array.isArray(data) ? data[0] : null
    if (owner) {
      try {
        // Prefer a UUID id for the saved owner session. If the owner record's id
        // is not a UUID, attempt to use the authenticated user's id (if any).
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        let sessionId: string | undefined = undefined

        if (owner.id && typeof owner.id === 'string' && uuidRegex.test(owner.id)) {
          sessionId = owner.id
        } else if (owner.id && typeof owner.id !== 'string' && uuidRegex.test(String(owner.id))) {
          sessionId = String(owner.id)
        } else {
          // Try to read the authenticated user's id from supabase auth (if available)
          try {
            const auth: any = supabase.auth
            if (auth && typeof auth.getUser === 'function') {
              // supabase-js v2: getUser() -> { data: { user } }
              // some environments may return { user } directly
              // wrap in try/catch to avoid breaking when auth isn't configured
              // eslint-disable-next-line no-await-in-loop
              const ures = await auth.getUser()
              const userId = (ures && ures.data && ures.data.user && ures.data.user.id) || (ures && ures.user && ures.user.id)
              if (userId && uuidRegex.test(userId)) sessionId = userId
            }
          } catch (e) {
            // ignore
          }
        }

        const toStore = { ...owner, id: sessionId ?? String(owner.id ?? '') }
        localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(toStore))
        if (!uuidRegex.test(toStore.id)) {
          // eslint-disable-next-line no-console
          console.warn('Saved owner session does not contain a UUID id', toStore)
        }
      } catch {}
    }
  }
  return { data, error }
}

export async function loginOwner(number: string, password: string) {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('number', number)
    .eq('password', password)
    .maybeSingle()

  if (error) {
    const message =
      typeof error.message === 'string' && error.message.toLowerCase().includes('row-level security')
        ? 'Owner login is blocked by your Supabase RLS policy. Allow SELECT on the owners table to continue.'
        : error.message
    return { data: null, error: { ...error, message } }
  }

  const owner = data || null
  if (!owner) {
    return { data: null, error: { message: 'Invalid phone number or password.' } }
  }
  try {
    // Normalize and prefer a UUID id as the session id (see registerOwner above)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    let sessionId: string | undefined = undefined
    if (owner.id && typeof owner.id === 'string' && uuidRegex.test(owner.id)) {
      sessionId = owner.id
    } else if (owner.id && typeof owner.id !== 'string' && uuidRegex.test(String(owner.id))) {
      sessionId = String(owner.id)
    } else {
      try {
        const auth: any = supabase.auth
        if (auth && typeof auth.getUser === 'function') {
          const ures = await auth.getUser()
          const userId = (ures && ures.data && ures.data.user && ures.data.user.id) || (ures && ures.user && ures.user.id)
          if (userId && uuidRegex.test(userId)) sessionId = userId
        }
      } catch (e) {
        // ignore
      }
    }

    const toStore = { ...owner, id: sessionId ?? String(owner.id ?? '') }
    localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(toStore))
    if (!uuidRegex.test(toStore.id)) {
      // eslint-disable-next-line no-console
      console.warn('Saved owner session does not contain a UUID id', toStore)
    }
  } catch {}
  return { data: owner, error: null }
}

export async function getOwnerById(id: string | number) {
  const { data, error } = await supabase.from('owners').select('*').eq('id', id).maybeSingle()

  if (error) {
    return { data: null, error }
  }

  if (data) {
    try {
      localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(data))
    } catch {}
  }

  return { data, error: null }
}

export function getOwnerSession(): OwnerRecord | null {
  try {
    const raw = localStorage.getItem(OWNER_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function signOutOwner() {
  try {
    localStorage.removeItem(OWNER_SESSION_KEY)
  } catch {}
}

export default supabase
