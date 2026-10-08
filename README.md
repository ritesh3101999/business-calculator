# ShopCalc Pro

ShopCalc Pro is a professional retail and business calculator built with React, TypeScript, and Vite. It is designed for shopkeepers and retail staff to calculate sales, taxes, discounts, margins, and change while maintaining a digital audit trail.

## Features

- Commercial calculator with standard arithmetic operations
- GST/VAT tax calculation with configurable rates
- Tax-inclusive and tax-exclusive pricing
- Discount and profit margin calculations
- Change denomination breakdown from cash tendered
- Quick-access department items and editable prices
- Digital paper tape for each transaction
- Daily sales register with completed sale history
- Printable thermal-style receipt
- Shop profile and business settings
- Persistent local storage for profile, quick items, and sales
- Sound toggle and currency selection
- Responsive layout for desktop and mobile screens

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide React icons
- Motion for interface animations

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The app is available at `http://localhost:3000`.

### Create a production build

```bash
npm run build
```

The production files are generated in the `dist` directory.

### Preview the production build

```bash
npm run preview
```

### Run the TypeScript check

```bash
npm run lint
```

## Usage

### Calculator

1. Enter prices and quantities using the calculator keypad.
2. Add tax and discount values as needed.
3. Choose the active tax rate from the calculator controls.
4. Complete the sale to add it to the audit tape and day book.

### Cash till

Open the cash till modal to calculate the expected change and break down denominations for the amount received.

### Cost and margin

Use the cost and margin modal to calculate selling price, cost, profit, markup, or margin percentage.

### Day book

The day book records completed sales and provides access to receipts from previous transactions.

### Settings

Configure the shop name, tagline, phone number, address, tax ID, currency, tax rates, and tax-inclusive pricing.

## Data Persistence

The application stores shop settings, quick items, and completed sales in browser local storage. Clearing browser storage removes the saved data.

## Project Structure

```text
src/
  App.tsx                  # Main application state and interactions
  components/             # Calculator, modal, and navigation UI
  types/                  # TypeScript domain types
  utils/
    audio.ts              # Sound preferences and audio playback
    calculatorEngine.ts   # Calculation helpers
    currencies.ts         # Currency definitions and formatting
```

## License

The source code is licensed under the Apache-2.0 License.
