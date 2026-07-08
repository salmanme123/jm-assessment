import { defineStore } from 'pinia'
import type { FlightOffer, SearchCriteria, SearchHistoryEntry } from '../types/flight'
import { searchDuffelOffers } from '../services/duffel'

interface FlightSearchState {
  criteria: SearchCriteria | null
  offers: FlightOffer[]
  isLoading: boolean
  error: string | null
  lastSubmittedAt: string | null
  searchHistory: SearchHistoryEntry[]
}

const STORAGE_KEY = 'flightSearch.session'

interface PersistedSession {
  criteria: SearchCriteria
  offers: FlightOffer[]
  lastSubmittedAt: string | null
}

function loadPersistedSession(): PersistedSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    return raw ? (JSON.parse(raw) as PersistedSession) : null
  } catch {
    return null
  }
}

function savePersistedSession(session: PersistedSession) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Ignore storage failures (e.g. private browsing quota limits).
  }
}

function clearPersistedSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}

const HISTORY_STORAGE_KEY = 'flightSearch.history'
const HISTORY_LIMIT = 10

function loadSearchHistory(): SearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)

    return raw ? (JSON.parse(raw) as SearchHistoryEntry[]) : []
  } catch {
    return []
  }
}

function saveSearchHistory(history: SearchHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch {
    // Ignore storage failures (e.g. private browsing quota limits).
  }
}

const persisted = loadPersistedSession()

export const useFlightSearchStore = defineStore('flightSearch', {
  state: (): FlightSearchState => ({
    criteria: persisted?.criteria ?? null,
    offers: persisted?.offers ?? [],
    isLoading: false,
    error: null,
    lastSubmittedAt: persisted?.lastSubmittedAt ?? null,
    searchHistory: loadSearchHistory(),
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
        savePersistedSession({ criteria: this.criteria, offers: this.offers, lastSubmittedAt: this.lastSubmittedAt })
        this.recordSearchHistory(this.criteria)
      } catch (error) {
        this.offers = []
        this.error = error instanceof Error ? error.message : 'Unable to search flights right now.'
        clearPersistedSession()
      } finally {
        this.isLoading = false
      }
    },

    recordSearchHistory(criteria: SearchCriteria) {
      const isDuplicate = JSON.stringify(this.searchHistory[0]?.criteria) === JSON.stringify(criteria)

      if (isDuplicate) {
        return
      }

      this.searchHistory = [{ criteria, searchedAt: new Date().toISOString() }, ...this.searchHistory].slice(0, HISTORY_LIMIT)
      saveSearchHistory(this.searchHistory)
    },

    clearSearchHistory() {
      this.searchHistory = []
      saveSearchHistory(this.searchHistory)
    },
  },
})
