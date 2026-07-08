<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import SearchForm from './components/SearchForm.vue'
import { useFlightSearchStore } from './stores/flightSearchStore'
import { cabinClassOptions, type CabinClass, type FlightOffer } from './types/flight'

const flightSearchStore = useFlightSearchStore()
const pageSize = 10
const currentPage = ref(1)
const selectedCabinClass = ref<CabinClass | 'all'>('all')
const selectedOffer = ref<FlightOffer | null>(null)
const selectedStopFilters = ref<string[]>(['nonstop', 'one_stop', 'two_plus'])
const departureTimeFrom = ref('')
const departureTimeTo = ref('')
const arrivalTimeFrom = ref('')
const arrivalTimeTo = ref('')
const sortByPrice = ref<'price_asc' | 'price_desc'>('price_asc')

const filteredOffers = computed(() => {
  return flightSearchStore.offers.filter((offer) => {
    const matchesCabin = selectedCabinClass.value === 'all' || offer.cabinClass === selectedCabinClass.value
    const matchesStops = selectedStopFilters.value.length === 0 || offer.slices.every((slice) => selectedStopFilters.value.includes(getStopFilterValue(slice.stops)))
    const matchesDeparture = matchesDepartureTimes(offer)

    return matchesCabin && matchesStops && matchesDeparture
  })
})
const sortedOffers = computed(() => {
  return [...filteredOffers.value].sort((left, right) => {
    const leftPrice = getOfferPriceAmount(left)
    const rightPrice = getOfferPriceAmount(right)

    return sortByPrice.value === 'price_asc' ? leftPrice - rightPrice : rightPrice - leftPrice
  })
})
const totalOffers = computed(() => sortedOffers.value.length)
const totalPages = computed(() => Math.max(Math.ceil(totalOffers.value / pageSize), 1))
const firstVisibleOffer = computed(() => (currentPage.value - 1) * pageSize + 1)
const lastVisibleOffer = computed(() => Math.min(currentPage.value * pageSize, totalOffers.value))
const paginatedOffers = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return sortedOffers.value.slice(start, start + pageSize)
})

function goToPreviousPage() {
  currentPage.value = Math.max(currentPage.value - 1, 1)
}

function goToNextPage() {
  currentPage.value = Math.min(currentPage.value + 1, totalPages.value)
}

function resetFilters() {
  selectedCabinClass.value = 'all'
  selectedStopFilters.value = ['nonstop', 'one_stop', 'two_plus']
  departureTimeFrom.value = ''
  departureTimeTo.value = ''
  arrivalTimeFrom.value = ''
  arrivalTimeTo.value = ''
  sortByPrice.value = 'price_asc'
}

function getOfferPriceAmount(offer: FlightOffer) {
  const amount = Number(offer.price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(amount) ? amount : Number.POSITIVE_INFINITY
}
function matchesDepartureTimes(offer: FlightOffer) {
  const hasDepartureFilter = Boolean(departureTimeFrom.value || departureTimeTo.value)
  const hasArrivalFilter = Boolean(arrivalTimeFrom.value || arrivalTimeTo.value)
  const departureTime = offer.departureDepartingAt?.slice(11, 16) || ''
  const arrivalTime = offer.departureArrivingAt?.slice(11, 16) || ''

  if ((hasDepartureFilter && !departureTime) || (hasArrivalFilter && !arrivalTime)) {
    return false
  }

  const matchesDepartureFrom = !departureTimeFrom.value || departureTime >= departureTimeFrom.value
  const matchesDepartureTo = !departureTimeTo.value || departureTime <= departureTimeTo.value
  const matchesArrivalFrom = !arrivalTimeFrom.value || arrivalTime >= arrivalTimeFrom.value
  const matchesArrivalTo = !arrivalTimeTo.value || arrivalTime <= arrivalTimeTo.value

  return matchesDepartureFrom && matchesDepartureTo && matchesArrivalFrom && matchesArrivalTo
}
function getStopFilterValue(stops: string) {
  if (stops === 'Nonstop') {
    return 'nonstop'
  }

  if (stops === '1 stop') {
    return 'one_stop'
  }

  return 'two_plus'
}
function openOfferDetails(offer: FlightOffer) {
  selectedOffer.value = offer
}

function closeOfferDetails() {
  selectedOffer.value = null
}

function getCabinLabel(cabinClass: CabinClass) {
  return cabinClassOptions.find((option) => option.value === cabinClass)?.label || cabinClass
}

watch(
  () => flightSearchStore.lastSubmittedAt,
  () => {
    currentPage.value = 1
  },
)

watch([selectedCabinClass, selectedStopFilters, departureTimeFrom, departureTimeTo, arrivalTimeFrom, arrivalTimeTo, sortByPrice], () => {
  currentPage.value = 1
})

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages
  }
})

void AppHeader
void SearchForm
void flightSearchStore
void cabinClassOptions
void selectedCabinClass
void selectedOffer
void selectedStopFilters
void departureTimeFrom
void departureTimeTo
void arrivalTimeFrom
void arrivalTimeTo
void sortByPrice
void filteredOffers
void sortedOffers
void paginatedOffers
void totalPages
void currentPage
void firstVisibleOffer
void lastVisibleOffer
void totalOffers
void goToPreviousPage
void goToNextPage
void resetFilters
void getOfferPriceAmount
void matchesDepartureTimes
void getStopFilterValue
void openOfferDetails
void closeOfferDetails
void getCabinLabel
</script>

<template src="./App.template.html"></template>
