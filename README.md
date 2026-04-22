# ☀️ SolarCalc

**SolarCalc** is a professional-grade solar system design and sizing engine. It goes beyond basic wattage calculators by functioning as an expert system—calculating precise Bill of Materials (BOM), determining series/parallel stringing, supporting inverter stacking, and providing interactive wiring diagrams. Users can save their designs to their account and generate public, shareable links with dynamic social media previews.

## 🌍 Production URL

SolarCalc is configured for production at:

`https://solarcalc.sanchez.ph`

The app metadata and `.env.example` defaults in this repository use that domain.

## ✅ Current Implementation Status

This repository now contains a working Next.js (App Router) implementation with:

* A typed solar calculation engine in `lib/calculator/engine.ts`
* A POST API endpoint at `/api/calculate`
* A web UI for entering system requirements and viewing results JSON
* Build + lint verified successfully

## 🔐 Auth + Persistence + Diagram

This app now also includes:

* Google sign-in with Auth.js
* Prisma schema for users, sessions, accounts, and saved projects
* Project save flow from the calculator API when `save_project = true`
* Public share pages at `/p/[shareId]`
* React Flow diagram rendering for generated wiring data

### Setup for Database and Auth

1. Copy `.env.example` to `.env` and fill in real values.
2. Generate Prisma client:
    ```bash
    npx prisma generate
    ```
3. Push schema to your database:
    ```bash
    npx prisma db push
    ```
4. Run the app:
    ```bash
    npm run dev
    ```

## 🧭 TODO Roadmap

The following items are not yet fully implemented and track the current gap between goals in `README.md` + `data/agent.md` and the shipped code.

### Missing Features

- [ ] Add Redis caching/state integration for calculation requests and/or project retrieval.
- [ ] Add dynamic Open Graph image generation (`@vercel/og`) for shared project URLs.
- [ ] Add inventory models in Prisma (`Inverter`, `SolarPanel`, `Battery`) and link sizing logic to inventory records.
- [ ] Add inventory seed pipeline (`npm run seed`) with sample components.
- [ ] Add saved-project management UI (list, edit, delete, visibility toggle) for authenticated users.
- [ ] Implement the documented Tailwind + shadcn/ui stack (or update docs if custom CSS remains the chosen approach).

### Partial Features To Complete

- [ ] Improve React Flow interaction model (currently basic rendering; add richer interactive behavior where needed).
- [ ] Render explanation text as contextual UI help (tooltips/hover cards), not only in raw payload views.
- [ ] Add explicit master/slave visual hierarchy for stacked inverters in diagram output.
- [ ] Align API response shape with strict agent JSON format (or document the current `{ result, save }` wrapper contract).

### Nice-To-Have Hardening

- [ ] Add tests for core calculator rules (inverter sizing, battery DoD logic, MPPT stringing boundaries).
- [ ] Add API validation/schema guardrails for request payloads.
- [ ] Add role/ownership checks for shared project privacy and future project management endpoints.

## ✨ Features

* **Comprehensive System Sizing:** Precisely calculates inverter capacity, solar array size, and battery bank requirements based on user inputs.
* **Advanced Engineering Rules:** * Calculates panel stringing (Series/Parallel) based on Inverter MPPT limits.
  * Supports **Inverter Stacking**: Parallel syncing or Split-Phase series stacking for 120V/240V systems.
* **Interactive Connection Diagrams:** Powered by React Flow, generating dynamic, zoomable, and interactive visual schematics of the proposed system wiring.
* **Intelligent BOM Generation:** Automatically sizes breakers to NEC standards and includes required accessories (mounts, cables).
* **Frictionless Auth & Project Saving:** Users can securely log in via Google OAuth to save, edit, and manage their system designs.
* **Viral Sharing & Open Graph:** Generate secure, unique links for saved projects. Includes dynamic Open Graph (OG) image generation, so sharing a project on Facebook or Reddit automatically displays a visually appealing summary card (e.g., "8kW Inverter | 12 Panels") in the feed.

## 🛠 Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
* **Database ORM:** [Prisma](https://www.prisma.io/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **Authentication:** [Auth.js](https://authjs.dev/) (formerly NextAuth, integrated with Google provider)
* **Caching/State:** [Redis](https://redis.io/) 
* **Diagrams:** [React Flow](https://reactflow.dev/)
* **Social Previews:** `@vercel/og` (Dynamic Image Generation)

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
* Node.js (v18+)
* PostgreSQL 
* Redis 

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/tildemark/solarcalc.git](https://github.com/tildemark/solarcalc.git)
   cd solarcalc
   ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory. You will need to configure your Google Cloud Console for the OAuth credentials:

    ```env
    # Database & Cache
    DATABASE_URL="postgresql://user:password@localhost:5432/solarcalc?schema=public"
    REDIS_URL="redis://localhost:6379"

    # Authentication (Auth.js)
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="generate_a_random_secret_string"
    GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    ```

4.  **Initialize the Database:**
    Push the Prisma schema to your PostgreSQL database.

    ```bash
    npx prisma db push
    npx prisma generate
    ```

5.  **Seed Component Inventory:**
    Populate the database with sample solar panels, inverters, and batteries.

    ```bash
    npm run seed
    ```

6.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

## 🗄️ Database Schema Overview

The database is divided into two logical zones:

1.  **Auth Zone (Auth.js):** Standard `User`, `Account`, and `Session` tables to handle Google OAuth seamlessly.
2.  **App Zone:** \* `Project`: Stores user designs. Includes a `uuid` for secure sharing and an `isPublic` boolean to control visibility.
      * `Inventory`: `Inverter`, `SolarPanel`, and `Battery` tables defining the physical constraints and specifications of real-world hardware.

## 🧠 Core Logic Engine

The calculation engine (`/lib/calculator`) acts as an expert system evaluating inputs against standard safety rules. For a deep dive into the rules engine and AI prompt logic guiding the explanations, see [`agent.md`](https://www.google.com/search?q=./agent.md).

## 📄 License

This project is licensed under the MIT License.
