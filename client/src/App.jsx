import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './components/admin/AdminLayout'

// ── Lazy-loaded pages ─────────────────────────────────────────
// Public
const LandingPage            = lazy(() => import('./pages/LandingPage'))
const LoginPage              = lazy(() => import('./pages/LoginPage'))
const RegisterUnifiedPage    = lazy(() => import('./pages/RegisterUnifiedPage'))
const CompteActivePage       = lazy(() => import('./pages/CompteActivePage'))
const DefinirMotDePassePage  = lazy(() => import('./pages/DefinirMotDePassePage'))
const EquipementsPage           = lazy(() => import('./pages/EquipementsPage'))
const ForumPage                 = lazy(() => import('./pages/ForumPage'))
const ForumForm                 = lazy(() => import('./pages/forms/ForumForm'))
const ProfessionnelsPage        = lazy(() => import('./pages/ProfessionnelsPage'))
const ProfessionnelDetailPage   = lazy(() => import('./pages/ProfessionnelDetailPage'))
const ProjetsPage               = lazy(() => import('./pages/ProjetsPage'))

// Protected
const DashboardPage          = lazy(() => import('./pages/DashboardPage'))
const EntreprisesPage        = lazy(() => import('./pages/EntreprisesPage'))
const RegisterPage           = lazy(() => import('./pages/RegisterPage'))
const HumanResourcesForm     = lazy(() => import('./pages/forms/HumanResourcesForm'))

// Admin
const AdminDashboard         = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminEntreprises       = lazy(() => import('./pages/admin/AdminEntreprises'))
const AdminEquipements       = lazy(() => import('./pages/admin/AdminEquipements'))
const AdminProjetsPublics    = lazy(() => import('./pages/admin/AdminProjetsPublics'))
const AdminProjetsPrives     = lazy(() => import('./pages/admin/AdminProjetsPrives'))
const AdminCarteSIG          = lazy(() => import('./pages/admin/AdminCarteSIG'))
const AdminDashboardBI       = lazy(() => import('./pages/admin/AdminDashboardBI'))
const AdminForum             = lazy(() => import('./pages/admin/AdminForum'))
const AdminForumContent      = lazy(() => import('./pages/admin/AdminForumContent'))
const AdminHumanResources    = lazy(() => import('./pages/admin/AdminHumanResources'))

// ── Layouts ───────────────────────────────────────────────────
function PublicLayout() {
  return (
    <>
      <Navbar />
      <div className="h-[100px] md:h-[148px]" />
      <main><Outlet /></main>
      <Footer />
    </>
  )
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <div className="h-[100px] md:h-[148px]" />
      <main style={{ minHeight: '100vh' }}><Outlet /></main>
    </>
  )
}

// ── Spinner ───────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'var(--koma-gray-bg)' }}>
      <span style={{ width:32, height:32, border:'3px solid #E2E8F0', borderTopColor:'var(--koma-teal)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Guards ────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

function RequireAdmin({ children }) {
  const { user, loading, isAdmin, role } = useAuth()
  if (loading) return <Spinner />
  if (user && role === null) return <Spinner />
  if (!user)    return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

// ── Admin wrapper ─────────────────────────────────────────────
function AdminWrapper() {
  return (
    <RequireAdmin>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </RequireAdmin>
  )
}

// ── Routes ────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Forum — page d'accueil (standalone, Navbar incluse dans ForumPage) */}
        <Route path="/"     element={<ForumPage />} />
        <Route path="/forum" element={<ForumPage />} />

        {/* Landing — accessible via /presentation */}
        <Route element={<PublicLayout />}>
          <Route path="/presentation" element={<LandingPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Inscription compte — publique */}
        <Route path="/register"             element={<RegisterUnifiedPage />} />
        <Route path="/compte-active"        element={<CompteActivePage />} />
        <Route path="/definir-mot-de-passe" element={<DefinirMotDePassePage />} />

        {/* Forum — publique */}
        <Route path="/forum/inscription" element={<ForumForm />} />

        {/* Professionnels — publique */}
        <Route element={<PublicLayout />}>
          <Route path="/professionnels"     element={<ProfessionnelsPage />} />
          <Route path="/professionnels/:id" element={<ProfessionnelDetailPage />} />
          <Route path="/projets"            element={<ProjetsPage />} />
        </Route>

        {/* Formulaires de déclaration — accès réservé aux utilisateurs connectés */}
        <Route path="/register/:slug" element={<RequireAuth><RegisterPage /></RequireAuth>} />
        <Route path="/ressources-humaines/inscription" element={<RequireAuth><HumanResourcesForm /></RequireAuth>} />

        {/* Pages connectées */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard"   element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/entreprises" element={<RequireAuth><EntreprisesPage /></RequireAuth>} />
          <Route path="/equipements" element={<EquipementsPage />} />
        </Route>

        {/* Back-office admin */}
        <Route path="/admin" element={<AdminWrapper />}>
          <Route index                   element={<AdminDashboard />} />
          <Route path="entreprises"      element={<AdminEntreprises />} />
          <Route path="equipements"      element={<AdminEquipements />} />
          <Route path="projets-publics"  element={<AdminProjetsPublics />} />
          <Route path="projets-prives"   element={<AdminProjetsPrives />} />
          <Route path="carte-sig"        element={<AdminCarteSIG />} />
          <Route path="dashboard-bi"     element={<AdminDashboardBI />} />
          <Route path="forum"            element={<AdminForum />} />
          <Route path="forum-content"    element={<AdminForumContent />} />
          <Route path="human-resources"  element={<AdminHumanResources />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

// ── Root ──────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="grain" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
