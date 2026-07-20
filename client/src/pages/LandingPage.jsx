import Hero from '../components/landing/Hero'
import Contexte from '../components/landing/Contexte'
import Vision from '../components/landing/Vision'
import PlatformOverview from '../components/landing/PlatformOverview'
import Composantes from '../components/landing/Composantes'
import Impacts from '../components/landing/Impacts'
import { useToast } from '../hooks/useToast'
import Toast from '../components/ui/Toast'

export default function LandingPage() {
  const { toast, showToast } = useToast()

  return (
    <>
      <Hero />
      <Contexte />
      <Vision />
      <PlatformOverview />
      <Composantes showToast={showToast} />
      <Impacts />
      <Toast visible={toast.visible} message={toast.message} />
    </>
  )
}
