import React, { useState } from 'react'
import OwnerLoginScreen from './OwnerLoginScreen'
import { PhoneEntryScreen } from './PhoneEntryScreen'

import { OwnerRecord } from '../../lib/supabase'

interface OwnerAuthScreenProps {
  onBack: () => void
  onRegistered: (owner: OwnerRecord | null) => void
  onLoggedIn: (session: any) => void
}

export const OwnerAuthScreen: React.FC<OwnerAuthScreenProps> = ({ onBack, onRegistered, onLoggedIn }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <button onClick={() => setMode('login')} className={`px-3 py-2 rounded-md ${mode === 'login' ? 'bg-[#1D9E75] text-white' : 'bg-gray-100'}`}>Login</button>
          <button onClick={() => setMode('register')} className={`px-3 py-2 rounded-md ${mode === 'register' ? 'bg-[#1D9E75] text-white' : 'bg-gray-100'}`}>Register</button>
        </div>
      </div>

      {mode === 'login' ? (
        <OwnerLoginScreen onBack={onBack} onLoggedIn={onLoggedIn} />
      ) : (
        <PhoneEntryScreen role={'Owner'} onBack={onBack} onRegistered={onRegistered} />
      )}
    </div>
  )
}

export default OwnerAuthScreen
