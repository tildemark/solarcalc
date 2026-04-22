# ☀️ SolarCalc

**SolarCalc** is a professional-grade solar system design and sizing engine. It goes beyond basic wattage calculators by functioning as an expert system—calculating precise Bill of Materials (BOM), determining series/parallel stringing, supporting inverter stacking, and providing dynamic wiring diagrams. Crucially, SolarCalc explains *why* each component and configuration was chosen.

## ✨ Features

* **Comprehensive System Sizing:** Precisely calculates inverter capacity, solar array size, and battery bank requirements based on user inputs (daily kWh, peak demand, autonomy, peak sun hours).
* **Advanced Configurations:** * Calculates panel stringing (Series/Parallel) based on Inverter MPPT voltage limits.
  * Supports **Inverter Stacking**: Calculates parallel syncing for high single-phase loads or Split-Phase series stacking for 120V/240V systems.
* **Intelligent BOM Generation:** Automatically calculates required accessories including breakers (sized to NEC 1.25x standards), mounting hardware (L-feet, mid/end clamps), and communication cables.
* **Educational Explanations:** Generates human-readable explanations detailing the engineering logic behind the selected components and configurations.
* **Connection Diagrams:** Dynamically renders visual schematics of the proposed system wiring.
* **Component Inventory:** Powered by a relational database of real-world solar components, enabling accurate matching rather than generic estimates.

## 🛠 Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
* **Database ORM:** [Prisma](https://www.prisma.io/)
* **Database:** [PostgreSQL](https://www.postgresql.org/) (Component inventory & user saved designs)
* **Caching/State:** [Redis](https://redis.io/) (Session management & multi-step wizard state)
* **Diagrams:** [React Flow](https://reactflow.dev/)

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
* Node.js (v18+)
* PostgreSQL (Running locally or via a cloud provider like Supabase/Neon)
* Redis (Running locally or via a cloud provider like Upstash)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/solarcalc.git](https://github.com/yourusername/solarcalc.git)
   cd solarcalc
````

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your connection strings. See `.env.example` for reference:

    ```env
    # PostgreSQL Database URL
    DATABASE_URL="postgresql://user:password@localhost:5432/solarcalc?schema=public"

    # Redis URL
    REDIS_URL="redis://localhost:6379"
    ```

4.  **Initialize the Database:**
    Push the Prisma schema to your PostgreSQL database and generate the Prisma Client.

    ```bash
    npx prisma db push
    npx prisma generate
    ```

5.  **Seed the Database (Optional but recommended):**
    Populate the database with sample solar panels, inverters, and batteries.

    ```bash
    npm run seed
    ```

6.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

## 🗄️ Database Schema Overview

The Prisma schema is designed to handle complex relationships between components:

  * `Inverter`: Stores wattage, voltage, MPPT ranges, and stackability (`isStackable`, `supportsSplitPhase`).
  * `SolarPanel`: Stores wattage, Voc, Isc, and dimensions.
  * `Battery`: Stores capacity (Ah), voltage, chemistry (LiFePO4, Lead Acid), and max DoD.
  * `Project`: Saves user-generated system designs and configurations.

## 🧠 Core Logic Engine

The calculation engine (`/lib/calculator`) acts as an expert system evaluating inputs against NEC safety standards and component constraints. For a deep dive into the rules engine and prompt logic guiding the system, see [`agent.md`](https://www.google.com/search?q=./agent.md).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome\! Feel free to check the [issues page](https://www.google.com/search?q=https://github.com/yourusername/solarcalc/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

