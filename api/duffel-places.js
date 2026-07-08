const DUFFEL_PLACES_URL = 'https://api.duffel.com/places/suggestions'

function json(response, statusCode, body) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

function mapPlace(place) {
  const iataCode = place.iata_code
  const cityName = place.city_name

  return {
    value: iataCode,
    label: cityName && cityName !== place.name ? `${iataCode} - ${place.name}, ${cityName}` : `${iataCode} - ${place.name}`,
  }
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    json(response, 405, { error: 'Method not allowed.' })
    return
  }

  const accessToken = process.env.DUFFEL_ACCESS_TOKEN

  if (!accessToken || accessToken === 'your_duffel_token_here') {
    json(response, 500, { error: 'DUFFEL_ACCESS_TOKEN is not configured on the server.' })
    return
  }

  const url = new URL(request.url, 'http://localhost')
  const query = url.searchParams.get('query')?.trim() || ''

  if (query.length < 2) {
    json(response, 200, { places: [] })
    return
  }

  try {
    const duffelResponse = await fetch(`${DUFFEL_PLACES_URL}?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Duffel-Version': 'v2',
      },
    })

    const payload = await duffelResponse.json()

    if (!duffelResponse.ok) {
      const message = payload?.errors?.[0]?.message || 'Duffel could not fetch place suggestions.'
      json(response, duffelResponse.status, { error: message })
      return
    }

    const places = (payload?.data || [])
      .filter((place) => typeof place?.iata_code === 'string' && place.iata_code.length === 3)
      .map(mapPlace)

    json(response, 200, { places })
  } catch (error) {
    json(response, 500, { error: error instanceof Error ? error.message : 'Unable to connect to Duffel.' })
  }
}
