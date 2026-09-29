import { useEffect, useState } from 'react'
import { checkBackendAvailability } from '../api/axios'

export type BackendStatusState = 'connected' | 'unavailable'

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatusState>('connected')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let active = true

    const refreshStatus = async () => {
      setIsChecking(true)
      try {
        const available = await checkBackendAvailability()
        if (active) {
          setStatus(available ? 'connected' : 'unavailable')
        }
      } catch {
        if (active) {
          setStatus('unavailable')
        }
      } finally {
        if (active) {
          setIsChecking(false)
        }
      }
    }

    void refreshStatus()
    const intervalId = window.setInterval(() => {
      void refreshStatus()
    }, 20000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  return { status, isChecking }
}
