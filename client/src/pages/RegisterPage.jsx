import { useParams, Navigate } from 'react-router-dom'
import EntreprisesForm   from './forms/EntreprisesForm'
import EquipementsForm   from './forms/EquipementsForm'
import ProjetsPublicsForm from './forms/ProjetsPublicsForm'
import ProjetsPrivesForm  from './forms/ProjetsPrivesForm'

const FORMS = {
  entreprises:    EntreprisesForm,
  equipements:    EquipementsForm,
  'projets-publics': ProjetsPublicsForm,
  'projets-prives':  ProjetsPrivesForm,
}

export default function RegisterPage() {
  const { slug } = useParams()
  const Form = FORMS[slug]
  if (!Form) return <Navigate to="/#composantes" replace />
  return <Form />
}
