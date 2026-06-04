import React, { useEffect, useState } from 'react'
import listingsLib, { Listing } from '../../lib/listings'
import { getOwnerSession } from '../../lib/supabase'
import { Edit, Trash, Loader, Home, BadgeIndianRupee, CircleCheckBig } from 'lucide-react'

export const OwnerDashboard: React.FC = () => {
  const [listings, setListings] = useState<Listing[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Listing | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const owner = getOwnerSession()
        const owner_id = owner?.id ? String(owner.id) : null
        if (!owner_id) {
          setListings([])
          setLoading(false)
          return
        }
        const res: any = await listingsLib.getListingsByOwner(owner_id)
        if (res?.error) {
          console.error('Failed to load owner listings', res.error)
          if (mounted) setListings([])
          return
        }
        if (mounted) setListings(res.data || [])
      } catch (err) {
        console.error('Failed to load listings', err)
        if (mounted) setListings([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const handleDelete = async (id?: number) => {
    if (!id) return
    if (!confirm('Delete this listing? This action cannot be undone.')) return
    try {
      const res = await listingsLib.deleteListing(id as any)
      if ((res as any)?.error) throw new Error((res as any).error.message || 'Delete failed')
      setListings((prev) => prev?.filter((l) => String(l.id) !== String(id)) ?? null)
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const handleToggleAvailability = async (id?: number, current?: boolean) => {
    if (!id) return
    try {
      const res = await listingsLib.updateListing(id as any, { is_rented: !current })
      if ((res as any)?.error) throw new Error((res as any).error.message || 'Update failed')
      setListings((prev) => prev?.map((l) => (String(l.id) === String(id) ? { ...l, is_rented: !current } as Listing : l)) ?? null)
    } catch (err) {
      console.error('Toggle failed', err)
    }
  }

  const handleSave = async (updates: Partial<Listing>) => {
    if (!editing?.id) return
    setSaving(true)
    try {
      const res = await listingsLib.updateListing(editing.id as any, updates)
      if ((res as any)?.error) throw new Error((res as any).error.message || 'Save failed')
      setListings((prev) => prev?.map((l) => (String(l.id) === String(editing.id) ? { ...l, ...updates } as Listing : l)) ?? null)
      setEditing(null)
    } catch (err) {
      console.error('Save failed', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4 text-center"><Loader className="mx-auto animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="surface-card rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 dark:border-emerald-900/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1D9E75]">Owner listings</p>
        <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Your listed rooms</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Manage your live room posts, update pricing, and switch availability quickly.
        </p>
      </div>

      {listings && listings.length === 0 && (
        <div className="surface-card rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-5 text-sm text-gray-500 dark:text-gray-400">
          No listings yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {listings?.map((l) => (
          <div
            key={l.id}
            className="surface-card overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1D9E75]/10 text-[#1D9E75]">
                  <Home className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#1D9E75]/12 px-2.5 py-1 text-[11px] font-bold text-[#1D9E75]">
                      Owner Listing
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      l.is_rented
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}>
                      {l.is_rented ? 'Rented' : 'Available'}
                    </span>
                  </div>
                  <h4 className="truncate text-base font-bold text-gray-900 dark:text-white">
                    {l.title || 'Untitled'}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {l.description || 'No description added yet.'}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <BadgeIndianRupee className="h-3.5 w-3.5" />
                      NPR {l.price || 0}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                      <CircleCheckBig className="h-3.5 w-3.5" />
                      {l.images?.length || 0} photos
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setEditing(l)}
                  className="inline-flex items-center space-x-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(l.id)}
                  className="inline-flex items-center space-x-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => handleToggleAvailability(l.id, !!l.is_rented)}
                  className="rounded-xl bg-[#1D9E75] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#147B5A]"
                >
                  {l.is_rented ? 'Mark Available' : 'Mark Rented'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl p-4">
            <h4 className="text-sm font-bold mb-2">Edit listing</h4>
            <div className="space-y-2">
              <label className="text-xs">Title</label>
              <input defaultValue={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full p-2 rounded border" />
              <label className="text-xs">Price</label>
              <input type="number" defaultValue={editing.price as any} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="w-full p-2 rounded border" />
              <label className="text-xs">Description</label>
              <textarea defaultValue={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full p-2 rounded border" />
            </div>

            <div className="flex justify-end items-center space-x-2 mt-4">
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded bg-gray-100">Cancel</button>
              <button onClick={() => handleSave({ title: editing.title, price: editing.price, description: editing.description })} disabled={saving} className="px-3 py-2 rounded bg-[#1D9E75] text-white">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerDashboard
