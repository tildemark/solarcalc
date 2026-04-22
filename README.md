# ☀️ SolarCalc

**SolarCalc** is a professional-grade solar system design and sizing engine. It goes beyond basic wattage calculators by functioning as an expert system—calculating precise Bill of Materials (BOM), determining series/parallel stringing, supporting inverter stacking, and providing interactive wiring diagrams. Users can save their designs to their account and generate public, shareable links with dynamic social media previews.

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
   git clone [https://github.com/yourusername/solarcalc.git](https://github.com/yourusername/solarcalc.git)
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
