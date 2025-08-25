# Property Management Fullstack Project

A fullstack property management application featuring a Go (Golang) backend API and a modern React (Vite + TypeScript + Tailwind) frontend dashboard. This project demonstrates clean architecture, JWT authentication, PostgreSQL integration, and a responsive UI for managing properties.

---

## Project Structure

```
Property-management-fullstack/
├── go-clean-real-estate/         # Go backend (API server, business logic, DB)
└── ivueit-dashboard-mocked/      # React frontend (dashboard UI)
```

---

## Backend: go-clean-real-estate

- **Language:** Go (Golang)
- **Architecture:** Clean Architecture
- **Features:**
  - RESTful API for property management
  - JWT authentication middleware
  - PostgreSQL support (with in-memory option)
  - WebSocket support (for real-time features)
- **Key Folders:**
  - `cmd/server/` — Entry point for the API server
  - `internal/domain/` — Domain models (e.g., `property.go`)
  - `internal/repository/` — Data access (Postgres & in-memory repos)
  - `internal/transport/http/` — HTTP handlers & JWT middleware
  - `internal/transport/ws/` — WebSocket hub
  - `internal/usecase/` — Business logic/services
  - `internal/infrastructure/db/` — DB connection (Postgres)
  - `tests/` — Unit tests

### Running the Backend

1. **Install Go (>=1.18) and PostgreSQL**
2. **Install dependencies:**
   ```sh
   cd go-clean-real-estate
   go mod tidy
   ```
3. **Configure DB:**
   - Set your PostgreSQL connection string in the code or via environment variables as needed.
4. **Run the server:**
   ```sh
   go run ./cmd/server
   ```

---

## Frontend: ivueit-dashboard-mocked

- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Features:**
  - Authentication (mocked)
  - Property listing, filtering, and pagination
  - Modern, responsive UI
  - State management with Redux Toolkit
- **Key Folders:**
  - `src/features/auth/` — Auth logic & login page
  - `src/features/properties/` — Property list, selectors, components
  - `src/app/` — Store & hooks
  - `src/services/` — API service layer
  - `src/mocks/` — Mock data & server

### Running the Frontend

1. **Install Node.js (>=18)**
2. **Install dependencies:**
   ```sh
   cd ivueit-dashboard-mocked
   npm install
   ```
3. **Start the dev server:**
   ```sh
   npm run dev
   ```
4. **Open** [http://localhost:5173](http://localhost:5173) in your browser.

---

## Development & Testing

- **Backend tests:**
  ```sh
  cd go-clean-real-estate
  go test ./...
  ```
- **Frontend:**
  - Use Vite's dev server for hot reload.
  - Mocked data for local development.

---

## Technologies Used

- **Backend:** Go, PostgreSQL, Gorilla Mux, JWT, WebSocket
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Redux Toolkit

---

## License

This project is licensed under the MIT License.

---

## Author

- [Prakash Saini](https://github.com/Prakash-sa)
