import { defineStore } from 'pinia'
import type { SearchCriteria } from '../types/flight'

interface FlightSearchState {
  criteria: SearchCriteria | null
  lastSubmittedAt: string | null
}

export const useFlightSearchStore = defineStore('flightSearch', {
  state: (): FlightSearchState => ({
    criteria: null,
    lastSubmittedAt: null,
  }),

  actions: {
    setCriteria(criteria: SearchCriteria) {
      this.criteria = { ...criteria }
      this.lastSubmittedAt = new Date().toISOString()
    },
  },
})
