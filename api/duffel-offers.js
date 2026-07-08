const DUFFEL_API_URL = 'https://api.duffel.com/air/offer_requests'
const CABIN_CLASSES = ['economy', 'premium_economy', 'business', 'first']

function json(response, statusCode, body) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

function isAirportCode(value) {
  return typeof value === 'string' && /^[A-Z]{3}$/.test(value.trim().toUpperCase())
}

function buildDuffelPayload(criteria, cabinClass) {
  const origin = criteria.origin.trim().toUpperCase()
  const destination = criteria.destination.trim().toUpperCase()

  const slices = [
    {
      origin,
      destination,
      departure_date: criteria.departureDate,
    },
  ]

  if (criteria.returnDate) {
    slices.push({
      origin: destination,
      destination: origin,
      departure_date: criteria.returnDate,
    })
  }

  return {
    data: {
      cabin_class: cabinClass,
      passengers: Array.from({ length: Number(criteria.passengerCount) }, () => ({
        type: 'adult',
      })),
      slices,
    },
  }
}

function parseRequestBody(body) {
  if (typeof body !== 'string') {
    return body
  }

  try {
    return JSON.parse(body)
  } catch {
    return null
  }
}

function validateCriteria(criteria) {
  if (!criteria || typeof criteria !== 'object') {
    return 'Search criteria is required.'
  }

  if (!isAirportCode(criteria.origin) || !isAirportCode(criteria.destination)) {
    return 'Origin and destination must be valid 3-letter IATA airport codes.'
  }

  if (criteria.origin.trim().toUpperCase() === criteria.destination.trim().toUpperCase()) {
    return 'Destination must be different from origin.'
  }

  if (!criteria.departureDate) {
    return 'Departure date is required.'
  }

  if (criteria.returnDate && criteria.returnDate < criteria.departureDate) {
    return 'Return date cannot be before departure date.'
  }

  if (!Number.isInteger(Number(criteria.passengerCount)) || Number(criteria.passengerCount) < 1) {
    return 'At least one passenger is required.'
  }

  if (![...CABIN_CLASSES, 'all'].includes(criteria.cabinClass)) {
    return 'Cabin class is invalid.'
  }

  return null
}

function formatDateTime(value) {
  if (!value) {
    return 'Time unavailable'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatDuration(duration) {
  if (!duration || typeof duration !== 'string') {
    return 'Duration unavailable'
  }

  const match = duration.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/)

  if (!match) {
    return duration
  }

  const days = Number(match[1] || 0)
  const hours = Number(match[2] || 0)
  const minutes = Number(match[3] || 0)
  const parts = []

  if (days) {
    parts.push(`${days}d`)
  }

  if (hours) {
    parts.push(`${hours}h`)
  }

  if (minutes) {
    parts.push(`${minutes}m`)
  }

  return parts.join(' ') || '0m'
}

function formatStops(segmentCount) {
  const stops = Math.max(segmentCount - 1, 0)

  if (stops === 0) {
    return 'Nonstop'
  }

  if (stops === 1) {
    return '1 stop'
  }

  return `${stops} stops`
}

function getSegmentCarrier(segment) {
  return segment?.operating_carrier?.name || segment?.marketing_carrier?.name || 'Airline unavailable'
}

function getAirportCode(airport) {
  return airport?.iata_code || airport?.iata_city_code || '---'
}

function getSliceLabel(index, sliceCount) {
  if (sliceCount === 1) {
    return 'One-way'
  }

  if (sliceCount === 2) {
    return index === 0 ? 'Departure' : 'Return'
  }

  return `Trip part ${index + 1}`
}

function getTripType(sliceCount) {
  if (sliceCount === 1) {
    return 'One-way trip'
  }

  if (sliceCount === 2) {
    return 'Round trip'
  }

  return 'Multi-city trip'
}

function mapSegment(segment) {
  const origin = getAirportCode(segment?.origin)
  const destination = getAirportCode(segment?.destination)

  return {
    route: `${origin} -> ${destination}`,
    time: `${formatDateTime(segment?.departing_at)} - ${formatDateTime(segment?.arriving_at)}`,
    airline: getSegmentCarrier(segment),
  }
}

function mapSlice(slice, index, sliceCount) {
  const segments = slice?.segments || []
  const first = segments[0] || {}
  const last = segments[segments.length - 1] || first
  const origin = getAirportCode(first.origin)
  const destination = getAirportCode(last.destination)

  return {
    label: getSliceLabel(index, sliceCount),
    route: `${origin} -> ${destination}`,
    duration: formatDuration(slice?.duration),
    stops: formatStops(segments.length),
    segments: segments.map(mapSegment),
  }
}

function mapOffer(offer, cabinClass) {
  const slices = offer.slices || []
  const mappedSlices = slices.map((slice, index) => mapSlice(slice, index, slices.length))
  const firstSlice = slices[0] || {}
  const firstSegments = firstSlice.segments || []
  const firstSegment = firstSegments[0] || {}
  const lastSegment = firstSegments[firstSegments.length - 1] || firstSegment
  const route = mappedSlices.map((slice) => slice.route).join(' / ')
  const totalSegmentCount = mappedSlices.reduce((total, slice) => total + slice.segments.length, 0)

  return {
    id: offer.id,
    airline: getSegmentCarrier(firstSegment),
    route: route || 'Route unavailable',
    time: `${formatDateTime(firstSegment.departing_at)} - ${formatDateTime(lastSegment.arriving_at)}`,
    departureDepartingAt: firstSegment.departing_at || '',
    departureArrivingAt: lastSegment.arriving_at || '',
    duration: formatDuration(firstSlice.duration),
    stops: formatStops(firstSegments.length),
    tripType: getTripType(slices.length),
    cabinClass,
    price: `${offer.total_currency || ''} ${offer.total_amount || ''}`.trim() || 'Price unavailable',
    details: `${slices.length} ${slices.length === 1 ? 'journey' : 'journeys'}, ${totalSegmentCount} ${totalSegmentCount === 1 ? 'flight' : 'flights'}`,
    slices: mappedSlices,
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    json(response, 405, { error: 'Method not allowed.' })
    return
  }

  const accessToken = process.env.DUFFEL_ACCESS_TOKEN

  if (!accessToken || accessToken === 'your_duffel_token_here') {
    json(response, 500, { error: 'DUFFEL_ACCESS_TOKEN is not configured on the server.' })
    return
  }

  const criteria = parseRequestBody(request.body)
  const validationError = validateCriteria(criteria)

  if (validationError) {
    json(response, 400, { error: validationError })
    return
  }

  try {
    const cabinClasses = criteria.cabinClass === 'all' ? CABIN_CLASSES : [criteria.cabinClass]
    const offerGroups = await Promise.all(cabinClasses.map(async (cabinClass) => {
      const duffelResponse = await fetch(DUFFEL_API_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Duffel-Version': 'v2',
        },
        body: JSON.stringify(buildDuffelPayload(criteria, cabinClass)),
      })

      const payload = await duffelResponse.json()

      if (!duffelResponse.ok) {
        const message = payload?.errors?.[0]?.message || 'Duffel could not complete the flight search.'
        const error = new Error(message)
        error.statusCode = duffelResponse.status
        throw error
      }

      return (payload?.data?.offers || []).map((offer) => ({ offer, cabinClass }))
    }))

    const rawOffers = offerGroups.flat().sort((left, right) => {
      const leftAmount = Number(left.offer?.total_amount || Number.POSITIVE_INFINITY)
      const rightAmount = Number(right.offer?.total_amount || Number.POSITIVE_INFINITY)

      return leftAmount - rightAmount
    })

    json(response, 200, {
      offers: rawOffers.map(({ offer, cabinClass }) => mapOffer(offer, cabinClass)),
    })
  } catch (error) {
    json(response, error?.statusCode || 500, {
      error: error instanceof Error ? error.message : 'Unable to connect to Duffel.',
    })
  }
}
