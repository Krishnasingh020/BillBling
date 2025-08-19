# 🏠 Flatmate Bill Management Web App

A simple and efficient **bill-splitting and expense tracking web app** designed for flatmates/roommates.  
This project helps users **add expenses, split bills, track balances, and manage payments** in a transparent and hassle-free way.

---

## ✨ Features

- **100% Free & Serverless**: No backend, no database, no hosting fees. Runs entirely in your browser.
- **Offline-First**: Works seamlessly even without an internet connection. Your data is always accessible.
- **Group Management**: Easily create groups and invite your flatmates with a unique code.
- **Bill Tracking**: Add and categorize shared expenses to keep a clear record of your spending.
- **Simplified Balances**: A clean dashboard instantly shows who owes whom, removing any confusion.
- **WhatsApp Integration**: Share settlement summaries with your group in a single click.
- **Light & Dark Modes**: A sleek, modern UI with support for both light and dark themes.


---

## 🛠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Bootstrap for UI)
- **Backend:** Node.js / Express.js
- **Database:** MySQL (Relational schema for users, expenses, and settlements)
- **Version Control:** Git + GitHub
- **Deployment:** Firebase Hosting / Vercel (Frontend) + Backend API Hosting (Node)

    Core Framework: Next.js (built on React) is the foundation of the app. We are using its App Router for modern, flexible routing and its static export capability to create a host-anywhere, serverless application.

    Language: The entire application is written in TypeScript, which adds static typing to JavaScript. This helps prevent common bugs and makes the code more robust and easier to maintain.

    Styling:
        Tailwind CSS: For all the styling. It's a utility-first CSS framework that allows for rapid and consistent UI development directly within the HTML.
        ShadCN/UI: The pre-built, accessible, and themeable UI components (like buttons, cards, and dialogs) are from ShadCN/UI. This accelerates development while ensuring a high-quality user interface.
        Lucide React: All icons used throughout the application, such as the dollar sign and user icons, are from this lightweight and clean icon library.

    Data Storage:
        Browser Local Storage: All application data—including user profiles, groups, and bills—is stored directly in the user's browser. This makes the app completely serverless, ensures user privacy, and allows it to function entirely offline.

    State Management: We use React's built-in tools for managing application state:
        React Hooks (useState, useEffect, useMemo): For managing component-level state and side effects.
        React Context API: For providing global state (like the current user and group data) to all components without having to pass props down through the entire component tree.

---

## 📂 Project Structure

- billbling-app/
  - src/
    - app/
      - (auth)/ → Routes for Login & Signup
      - (main)/ → Routes for Dashboard, Bills, etc.
      - layout.tsx → Root layout
      - page.tsx → Public landing page
      - globals.css → Global styles
    - components/
      - ui/ → Base components (Button, Card, etc.)
      - dashboard/ → Dashboard-specific components
    - providers/
      - auth-provider.tsx → Manages user login state
      - group-provider.tsx → Manages groups & bills
      - theme-provider.tsx → Handles light/dark mode
    - hooks/
      - use-local-storage.ts → Save/read data locally
    - lib/
      - utils.ts → Helper functions
    - types/
      - index.ts → Type definitions
  - public/ → Static assets
  - package.json → Dependencies & scripts
  - tailwind.config.ts → Tailwind setup
---
## Getting Started
To run the project locally:

    Clone the repository:

    git clone https://github.com/Krishnasingh020/billbling.git

Install dependencies:

    npm install
    
    Run the development server:
    
    npm run dev

<<<<<<< HEAD

=======
---
## Live Link

  https://bill-bling.vercel.app/
---
## 🤝 Contributing

Contributions are welcome!  
Feel free to open an issue or submit a PR.

---
## 📜 License

This project is licensed under the MIT License.


