import { Listing as UiListing, ROOM_CATEGORIES } from '../data/appSchema'

type DbListing = {
  id?: number | string
  title?: string | null
  description?: string | null
  price?: number | null
  images?: string[] | null
  lat?: number | null
  lng?: number | null
  owner_id?: string | null
  created_at?: string | null
  createdAt?: string | null
  type?: string | null
  location?: string | null
  is_rented?: boolean | null
}

const fallbackImage = 'https://placehold.co/800x600/png?text=Basai.com'

function inferRoomCategory(title?: string | null) {
  const source = (title || '').toLowerCase()
  if (source.includes('3bhk')) return '3BHK'
  if (source.includes('2bhk')) return '2BHK'
  if (source.includes('1bhk')) return '1BHK'
  if (source.includes('2 room')) return '2 Room'
  if (source.includes('1 room') || source.includes('single room')) return '1 Room'
  return '2BHK'
}

export function mapDbListingToUiListing(row: DbListing): UiListing {
  const type = ROOM_CATEGORIES.includes((row.type as UiListing['type']) || inferRoomCategory(row.title))
    ? ((row.type as UiListing['type']) || inferRoomCategory(row.title))
    : inferRoomCategory(row.title)

  const createdAt = row.created_at || row.createdAt || new Date().toISOString()
  const price = Number(row.price || 0)
  const latitude = typeof row.lat === 'number' ? row.lat : 27.7172
  const longitude = typeof row.lng === 'number' ? row.lng : 85.324

  return {
    id: String(row.id ?? `db-${createdAt}`),
    title: row.title || 'New room listing',
    location: row.location || 'Owner listed location',
    price,
    type,
    status: row.is_rented ? 'Rented' : 'Available',
    isFeatured: false,
    isVerified: true,
    ownerName: 'Verified Owner',
    ownerPhone: '98XXXXXXXX',
    isOwnerVerified: true,
    images: row.images && row.images.length > 0 ? row.images : [fallbackImage],
    amenities: {
      beds: type === '3BHK' ? 3 : type === '2BHK' || type === '2 Room' ? 2 : 1,
      baths: type === '3BHK' ? 2 : 1,
      furnishing: 'Semi Furnished',
      parking: 'Bike Only',
    },
    tags: ['Fresh Listing', 'Direct Owner'],
    distance: 'New',
    rating: 4.6,
    description: row.description || row.title || 'Newly listed room from owner profile.',
    latitude,
    longitude,
    createdAt,
  }
}
