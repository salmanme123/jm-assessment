export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'

export interface SearchCriteria {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  passengerCount: number
  cabinClass: CabinClass
}

export const cabinClassOptions: Array<{ label: string; value: CabinClass }> = [
  { label: 'Economy', value: 'economy' },
  { label: 'Premium economy', value: 'premium_economy' },
  { label: 'Business', value: 'business' },
  { label: 'First', value: 'first' },
]
