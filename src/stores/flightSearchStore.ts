import { defineStore } from 'pinia'
import type { FlightOffer, SearchCriteria } from '../types/flight'
import { searchDuffelOffers } from '../services/duffel'

interface FlightSearchState {
  criteria: SearchCriteria | null
  offers: FlightOffer[]
  isLoading: boolean
  error: string | null
  lastSubmittedAt: string | null
}

export const useFlightSearchStore = defineStore('flightSearch', {
  state: (): FlightSearchState => ({
    criteria: null,
    offers: [],
    isLoading: false,
    error: null,
    lastSubmittedAt: null,
  }),

  actions: {
    async searchFlights(criteria: SearchCriteria) {
      this.criteria = { ...criteria }
      this.lastSubmittedAt = new Date().toISOString()
      this.isLoading = true
      this.error = null

      try {
        const result = await searchDuffelOffers(criteria)
        this.offers = result.offers
      } catch (error) {
        this.offers = []
        this.error = error instanceof Error ? error.message : 'Unable to search flights right now.'
      } finally {
        this.isLoading = false
      }
    },
  },
})
