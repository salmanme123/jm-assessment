# Journey Mentor Flight Search

This assessment project builds a Vue 3 flight search interface for Journey Mentor. The app gives users a simple way to enter flight criteria, validate the search inputs, and view a first pass of flight results and filters.

## What We Are Doing

- Building a responsive flight search page with a Journey Mentor header, search form, filters, and offer cards.
- Capturing core search criteria such as origin, destination, departure date, return date, passenger count, and cabin class.
- Validating the form before submission, including required locations, different origin and destination, future departure dates, valid return dates, and at least one passenger.
- Normalizing airport codes to uppercase before saving the submitted search.
- Storing the latest submitted search criteria in a Pinia store so the search state can be reused by future result or API logic.
- Showing placeholder flight offers while the backend/API integration is still to come.

## Tech Stack

- Vue 3 with TypeScript
- Vite
- Pinia
- Tailwind CSS

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
