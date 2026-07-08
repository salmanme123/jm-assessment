import type { DuffelOffersResponse, SearchCriteria } from '../types/flight'

export async function searchDuffelOffers(criteria: SearchCriteria): Promise<DuffelOffersResponse> {
  const response = await fetch('/api/duffel-offers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(criteria),
  })

  const payload = await response.json().catch(() => null) as Partial<DuffelOffersResponse> & { error?: string } | null

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to search flights right now.')
  }

  return {
    offers: payload?.offers ?? [],
  }
}