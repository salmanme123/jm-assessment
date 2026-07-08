export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'
export type SearchCabinClass = CabinClass | 'all'

export interface SearchCriteria {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  passengerCount: number
  cabinClass: SearchCabinClass
}

export interface FlightOffer {
  id: string
  airline: string
  route: string
  time: string
  departureDepartingAt: string
  departureArrivingAt: string
  duration: string
  stops: string
  tripType: string
  cabinClass: CabinClass
  price: string
  details: string
  baggage: string
  fareConditions: FareConditions
  slices: FlightSlice[]
}

export interface FareConditions {
  refundable: string
  changeable: string
}

export interface FlightSlice {
  label: string
  route: string
  duration: string
  stops: string
  segments: FlightSegment[]
}

export interface FlightSegment {
  route: string
  time: string
  airline: string
  baggage: string
  layoverAfter: string | null
}

export interface DuffelOffersResponse {
  offers: FlightOffer[]
}

export interface SearchHistoryEntry {
  criteria: SearchCriteria
  searchedAt: string
}

export interface PlaceSuggestion {
  value: string
  label: string
}

export interface PlaceSuggestionsResponse {
  places: PlaceSuggestion[]
}

export const cabinClassOptions: Array<{ label: string; value: CabinClass }> = [
  { label: 'Economy', value: 'economy' },
  { label: 'Premium economy', value: 'premium_economy' },
  { label: 'Business', value: 'business' },
  { label: 'First', value: 'first' },
]
