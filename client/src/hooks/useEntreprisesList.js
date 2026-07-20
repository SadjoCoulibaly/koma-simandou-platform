import { useState, useEffect } from 'react'
import { entreprisesApi } from '../lib/api'

export function useEntreprisesList() {
  const [entreprises, setEntreprises] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    entreprisesApi.getAll({ limit: 200, statut: 'actif' })
      .then(res => setEntreprises(res.data || []))
      .catch(() => setEntreprises([]))
      .finally(() => setLoading(false))
  }, [])

  return { entreprises, loading }
}
