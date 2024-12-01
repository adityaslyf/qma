import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useConfetti } from './useConfetti'

export function useEmailSubscription() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { triggerConfetti } = useConfetti()

  const subscribeEmail = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const { error: supabaseError } = await supabase
        .from('subscriptions')
        .insert([{ email, subscribed_at: new Date().toISOString() }])

      if (supabaseError) throw supabaseError

      setSuccess(true)
      triggerConfetti()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { subscribeEmail, loading, error, success }
} 