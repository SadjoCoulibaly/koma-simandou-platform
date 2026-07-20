import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Inject auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb-access-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handler
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Erreur réseau'
    return Promise.reject(new Error(message))
  }
)

// ── Entreprises ──────────────────────────────────────────────
export const entreprisesApi = {
  getAll:   (params) => api.get('/entreprises', { params }),
  getById:  (id)     => api.get(`/entreprises/${id}`),
  create:   (data)   => api.post('/entreprises', data),
  update:   (id, data) => api.put(`/entreprises/${id}`, data),
  validate:      (id)     => api.patch(`/entreprises/${id}/validate`),
  reject:        (id)     => api.patch(`/entreprises/${id}/reject`),
  delete:        (id)     => api.delete(`/entreprises/${id}`),
  generateInvite:(id)     => api.post(`/entreprises/${id}/invite`),
}

// ── Équipements ──────────────────────────────────────────────
export const equipementsApi = {
  getAll:   (params) => api.get('/equipements', { params }),
  getById:  (id)     => api.get(`/equipements/${id}`),
  create:   (data)   => api.post('/equipements', data),
  update:   (id, data) => api.put(`/equipements/${id}`, data),
  validate: (id)     => api.patch(`/equipements/${id}/validate`),
  reject:   (id)     => api.patch(`/equipements/${id}/reject`),
  delete:   (id)     => api.delete(`/equipements/${id}`),
}

// ── Projets publics ──────────────────────────────────────────
export const projetsPublicsApi = {
  getAll:      (params)   => api.get('/projets/publics', { params }),
  getAllAdmin:  (params)   => api.get('/projets/publics/admin', { params }),
  getById:     (id)       => api.get(`/projets/publics/${id}`),
  create:      (data)     => api.post('/projets/publics', data),
  update:      (id, data) => api.put(`/projets/publics/${id}`, data),
  validate:    (id)       => api.patch(`/projets/publics/${id}/validate`),
  reject:      (id)       => api.patch(`/projets/publics/${id}/reject`),
  delete:      (id)       => api.delete(`/projets/publics/${id}`),
}

// ── Projets privés ───────────────────────────────────────────
export const projetsPrivesApi = {
  getAll:   (params) => api.get('/projets/prives', { params }),
  getById:  (id)     => api.get(`/projets/prives/${id}`),
  create:   (data)   => api.post('/projets/prives', data),
  update:   (id, data) => api.put(`/projets/prives/${id}`, data),
  validate: (id)     => api.patch(`/projets/prives/${id}/validate`),
  reject:   (id)     => api.patch(`/projets/prives/${id}/reject`),
}

// ── Ressources humaines ──────────────────────────────────────
export const humanResourcesApi = {
  getAll:      (params)            => api.get('/human-resources', { params }),
  getById:     (id)                => api.get(`/human-resources/${id}`),
  create:      (data)              => api.post('/human-resources', data),
  uploadPhoto: (base64, filename, mimeType) => api.post('/human-resources/upload-photo', { base64, filename, mimeType }),
  validate:    (id)                => api.patch(`/human-resources/${id}/validate`),
  reject:      (id)                => api.patch(`/human-resources/${id}/reject`),
  delete:      (id)                => api.delete(`/human-resources/${id}`),
}

// ── Stats dashboard ──────────────────────────────────────────
export const statsApi = {
  getSummary:      () => api.get('/stats/summary'),
  getPublic:       () => api.get('/stats/public'),
  getDistribution: () => api.get('/stats/distribution'),
  getByMonth:      () => api.get('/stats/by-month'),
  getByCategory:   () => api.get('/stats/by-category'),
}

// ── Forum ─────────────────────────────────────────────────────
export const forumApi = {
  inscrire:      (data) => api.post('/forum', data),
  getAll:        (params) => api.get('/forum', { params }),
  marquerPresent:(id)   => api.patch(`/forum/${id}/present`),
  supprimer:     (id)   => api.delete(`/forum/${id}`),
}

export default api
