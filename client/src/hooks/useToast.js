import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '' })

  const showToast = useCallback((message) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 3400)
  }, [])

  return { toast, showToast }
}
