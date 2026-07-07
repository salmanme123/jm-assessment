<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import SearchForm from './components/SearchForm.vue'

const placeholderOffers = [
  {
    id: 'ba-117',
    airline: 'British Airways',
    route: 'LHR -> JFK',
    time: '09:20 - 12:35',
    duration: '8h 15m',
    stops: 'Nonstop',
    price: '$482',
  },
  {
    id: 'ek-203',
    airline: 'Emirates',
    route: 'DXB -> JFK',
    time: '02:50 - 08:55',
    duration: '14h 05m',
    stops: 'Nonstop',
    price: '$721',
  },
  {
    id: 'qr-701',
    airline: 'Qatar Airways',
    route: 'ISB -> LHR',
    time: '03:35 - 13:20',
    duration: '13h 45m',
    stops: '1 stop',
    price: '$638',
  },
]

void AppHeader
void SearchForm
void placeholderOffers
</script>

<template src="./App.template.html"></template>
