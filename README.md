# Journey Mentor Flight Search

This assessment project builds a Vue 3 flight search interface for Journey Mentor. The app lets a user enter flight criteria, searches Duffel in sandbox mode through server-side API routes, and returns a usable, sortable, filterable list of offers.

## Live Demo

Live URL: add the deployed URL here before submission.

## Tech Stack

- Vue 3 with the Composition API and `<script setup>`
- TypeScript
- Vite
- Tailwind CSS
- Pinia
- Duffel sandbox API

## Running Locally

Install dependencies:

```sh
npm install
```

Create a `.env.local` file and add your Duffel sandbox token:

```sh
DUFFEL_ACCESS_TOKEN=your_duffel_test_token_here
```

Start the development server:

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

## Duffel and CORS Approach

Duffel does not allow direct browser requests, so the Vue app does not call Duffel directly. Instead, it calls server-side API routes:

- `/api/duffel-offers` creates Duffel offer requests and maps the response into the offer shape used by the UI.
- `/api/duffel-places` calls Duffel place suggestions for the debounced origin/destination autocomplete.
- `vite.config.ts` includes development middleware so the same `/api/*` routes work during local Vite development.
- The Duffel token is read from `DUFFEL_ACCESS_TOKEN` on the server and is never committed or exposed to the browser.

## State Management Decision

I used Pinia because the flight search state is shared across the search form, filters, results list, date shifting controls, selected offer details, and recent searches. A local composable would work for a smaller version, but Pinia keeps the async search action, loading/error state, persisted results, and history in one predictable store without much overhead.

The current search criteria and returned offers are persisted in `sessionStorage`, so a page reload keeps the active search and results in the same tab. Recent searches are persisted in `localStorage`, so users can quickly re-run previous routes.

## Implemented Features

- Validated search form for origin, destination, departure date, optional return date, passenger count, and cabin class.
- Debounced origin/destination autocomplete backed by Duffel place suggestions.
- Loading, empty, and error states for flight search.
- Result cards showing airline, route, departure/arrival time, duration, stops, baggage summary, and total price.
- Sorting by price, total duration, and departure time.
- Filtering by stops, airline, cabin class, price range, departure time, and arrival time.
- Offer details modal with slices, segments, layovers, fare conditions, and baggage allowance.
- Previous/next day controls that shift the current search dates and re-run the search.
- Search/result persistence across page reloads.
- Recent search history with clickable search chips.

## Trade-offs and Skipped Items

- The search form requires one cabin class per request. This keeps each search to one Duffel offer request instead of firing parallel requests for every cabin class, which is friendlier for small serverless deployments.
- Result duration and stop summaries on the card focus on the outbound slice. The details modal shows the full trip breakdown for round trips.
- Search history is persisted, but there is no dedicated management view beyond the recent-search chips and clear action.
