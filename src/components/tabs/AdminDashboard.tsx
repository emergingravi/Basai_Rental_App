import React, { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import listingsLib from '../../lib/listings'
import { Trash, Loader } from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const [owners, setOwners] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const p = await supabase.from('owners').select('*')
        const l = await supabase.from('listings').select('*')
        if (mounted) {
          setOwners(p.data || [])
          setListings(l.data || [])
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load admin data', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const handleDeleteListing = async (id?: number) => {
    if (!id) return
    if (!confirm('Delete this listing?')) return
    try {
      await listingsLib.deleteListing(id)
      setListings((prev) => prev.filter((it) => it.id !== id))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete failed', err)
    }
  }

  if (loading) return <div className="p-4 text-center"><Loader className="mx-auto" /></div>

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold">Admin Panel</h3>

      <section>
        <h4 className="text-xs font-semibold">Owners</h4>
        <div className="grid gap-2 mt-2">
          {owners.map((o) => (
            <div key={o.id} className="surface-card p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{o.name || 'Unnamed'}</div>
                  <div className="text-[11px] text-gray-500">{o.number || 'No number'}</div>
                </div>
                <div className="text-[11px] text-gray-400">ID: {o.id}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-xs font-semibold">All Listings</h4>
        <div className="grid gap-2 mt-2">
          {listings.map((l) => (
            <div key={l.id} className="surface-card p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{l.title || 'Untitled'}</div>
                <div className="text-[11px] text-gray-500">Owner: {l.owner_id || 'unknown'}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleDeleteListing(l.id)} className="p-2 rounded-md bg-rose-50 hover:bg-rose-100 text-xs flex items-center space-x-1">
                  <Trash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
