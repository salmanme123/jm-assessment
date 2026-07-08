# Journey Mentor Flight Search

This assessment project builds a Vue 3 flight search interface for Journey Mentor. The app gives users a simple way to enter flight criteria, validate the search inputs, and view a first pass of flight results and filters.

## What We Are Doing

- Building a responsive flight search page with a Journey Mentor header, search form, filters, and offer cards.
- Capturing core search criteria such as origin, destination, departure date, return date, passenger count, and cabin class.
- Validating the form before submission, including required locations, different origin and destination, future departure dates, valid return dates, and at least one passenger.
- Normalizing airport codes to uppercase before saving the submitted search.
- Searching Duffel through a server-side API route so the Duffel access token stays off the client.
- Storing the latest submitted search criteria, loading state, errors, and returned offers in a Pinia store.
- Filtering results by cabin class, number of stops, and departure/arrival time ranges.
- Sorting results by price (lowest or highest first) and paginating them.
- Showing a details view for a selected offer with its full trip breakdown by slice and flight segment.

## Why Cabin Class Is on the Search Form

The "Find available flights" form includes a **Cabin** field so every search is scoped to a single cabin class (economy, premium economy, business, or first) instead of firing one parallel Duffel request per cabin class.
This keeps each search to a single Duffel request, which previously ran the API route out of memory on Vercel's free plan when searching all cabin classes at once.

## Duffel Setup

You need a Duffel access token to run this project locally. Create one and add it as a server-side environment variable in `.env.local`:

```sh
DUFFEL_ACCESS_TOKEN=your_duffel_token_here
```

Then run:

```sh
npm run dev
```

The frontend calls `/api/duffel-offers`, which calls Duffel's offer request endpoint using that token.

## Tech Stack

- Vue 3 with TypeScript
- Vite
- Pinia
- Tailwind CSS
- Duffel API

## Project Setup

Install dependencies:

```sh
npm install
```

Run the development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```
