import supabase from './supabase'

export type Listing = {
  id?: number
  title?: string
  description?: string
  price?: number
  images?: string[]
  lat?: number
  lng?: number
  owner_id?: string
}

export async function createListing(listing: Listing) {
  const cols = 'id, title, description, price, images, lat, lng, owner_id, created_at, location, owner:owners(id,name,number,address)'
  const { data, error } = await supabase.from('listings').insert([listing]).select(cols)
  if (error) {
    const message =
      typeof error.message === 'string' && error.message.toLowerCase().includes('404')
        ? 'The public listings table was not found in Supabase.'
        : error.message
    return { data: null, error: { ...error, message } }
  }
  return { data, error: null }
}

export async function getListingsByOwner(owner_id: string) {
  const fallback = await getAllListings()
  if (fallback.error) {
    return fallback
  }

  const filtered = Array.isArray(fallback.data)
    ? fallback.data.filter((item: any) => String(item?.owner_id ?? '') === String(owner_id))
    : []

  return { data: filtered, error: null }
}

export async function getAllListings() {
  const cols = 'id, title, description, price, images, lat, lng, owner_id, created_at, location, owner:owners(id,name,number,address)'
  const { data, error } = await supabase.from('listings').select(cols)
  if (error) {
    const message =
      typeof error.message === 'string' && error.message.toLowerCase().includes('404')
        ? 'The public listings table was not found in Supabase.'
        : error.message
    return { data: null, error: { ...error, message } }
  }
  return { data, error: null }
}

export async function updateListing(id: number, updates: Partial<Listing>) {
  const cols = 'id, title, description, price, images, lat, lng, owner_id, created_at, location, owner:owners(id,name,number,address)'
  const { data, error } = await supabase.from('listings').update(updates).eq('id', id).select(cols)
  if (error) {
    const message =
      typeof error.message === 'string' && error.message.toLowerCase().includes('404')
        ? 'The public listings table was not found in Supabase.'
        : error.message
    return { data: null, error: { ...error, message } }
  }
  return { data, error: null }
}

export async function deleteListing(id: number) {
  const cols = 'id'
  const { data, error } = await supabase.from('listings').delete().eq('id', id).select(cols)
  if (error) {
    const message =
      typeof error.message === 'string' && error.message.toLowerCase().includes('404')
        ? 'The public listings table was not found in Supabase.'
        : error.message
    return { data: null, error: { ...error, message } }
  }
  return { data, error: null }
}

export default {
  createListing,
  getAllListings,
  getListingsByOwner,
  updateListing,
  deleteListing,
}
