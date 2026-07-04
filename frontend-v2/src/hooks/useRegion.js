import { useParams } from 'react-router-dom'
import { regions } from '../data/regions'

export function useRegion() {
  const { slug } = useParams()
  return regions.find((r) => r.slug === slug) ?? null
}
