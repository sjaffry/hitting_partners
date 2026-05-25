# HittingPartners 🎾

**Find your next tennis hitting partner — fast.**

HittingPartners is a React.js web application that lets players post hitting-session requests, specify their preferences, and notify every registered player via SMS. The first responder claims the slot.

---

## Features

| Feature | Description |
|---|---|
| **Post a Request** | Pick a date, time, court, preferred USTA rating & gender |
| **SMS Blast** | Notifies all registered players (Twilio/SNS stub — ready for backend wiring) |
| **Deep-link Accept** | Responders click the link in the SMS and accept the open slot |
| **Conflict Prevention** | Once a slot is accepted, subsequent attempts are rejected |
| **My Requests** | Dashboard to track, share, or cancel your open requests |
| **Auth** | Phone-number based registration & login (stub — no real OTP yet) |
| **Responsive** | Fully optimised for both desktop and mobile |

---

## Tech Stack

- **React 19** + **Vite**
- **React Router v7** (client-side routing + deep-link support)
- **CSS Custom Properties** (design token system — no CSS framework)
- **localStorage** as the data layer stub (replace with real API calls)

---

## Project Structure

```
src/
  api/
    stubs.js          # All backend API stubs (replace with real fetch calls)
  context/
    AuthContext.jsx   # Auth state (user, login, logout)
  components/
    Layout.jsx        # Sticky header, nav, footer
    Layout.css
  pages/
    HomePage.jsx      # Landing page with hero + feature cards
    RequestPage.jsx   # Create-a-hitting-request form
    AcceptPage.jsx    # Deep-link page — accept an open request
    MyRequestsPage.jsx# Per-user request dashboard
    AuthPage.jsx      # Register + Login pages
    *.css             # Co-located page styles
  App.jsx             # Router setup
  index.css           # Design tokens + global utility classes
```

---

## Getting Started

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build
npm run lint      # ESLint check
```

---

## Wiring Up the Backend

All API calls are isolated in **`src/api/stubs.js`**. Each function has a JSDoc comment describing the expected contract. To connect a real backend:

1. Replace the `localStorage` read/write in each function with `fetch()` (or Axios) calls.
2. Implement the SMS blast in `createHittingRequest` using Twilio/AWS SNS.
3. Add real phone OTP in `loginUser` / `registerUser`.
4. Update `vite.config.js` proxy section to point to your API server.
