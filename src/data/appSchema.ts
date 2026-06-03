export type UserRole = 'Customer' | 'Owner'
export type RoomCategory = '1 Room' | '2 Room' | '1BHK' | '2BHK' | '3BHK'

export interface Listing {
  id: string
  title: string
  location: string
  price: number
  type: RoomCategory
  status: 'Available' | 'Rented'
  isFeatured: boolean
  isVerified: boolean
  ownerName: string
  ownerPhone: string
  ownerAddress?: string
  ownerAvatar?: string
  isOwnerVerified: boolean
  images: string[]
  amenities: {
    beds: number
    baths: number
    furnishing: 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished'
    parking: 'Bike & Car' | 'Bike Only' | 'None'
  }
  tags: string[]
  distance: string
  rating: number
  description: string
  latitude: number
  longitude: number
  createdAt: string
}

export const ROOM_CATEGORIES: RoomCategory[] = ['1 Room', '2 Room', '1BHK', '2BHK', '3BHK']
export const FILTERS = ['All', ...ROOM_CATEGORIES]

export const AMENITIES_LIST = [
  { id: 'water', label: '24/7 Melamchi Water', icon: 'Droplets' },
  { id: 'parking', label: 'Car & Bike Covered Parking', icon: 'Car' },
  { id: 'furnishing', label: 'Fully Furnished Setup', icon: 'Sofa' },
  { id: 'wifi', label: 'High-speed Fiber Ready', icon: 'Wifi' },
  { id: 'security', label: 'CCTV Surveillance', icon: 'ShieldCheck' },
  { id: 'balcony', label: 'Private Balcony', icon: 'Sun' },
  { id: 'waste', label: 'Daily Waste Collection', icon: 'Trash2' },
]
