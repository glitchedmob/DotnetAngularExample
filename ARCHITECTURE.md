# Architecture

## Overview

This repository contains a small blog application with an Angular frontend and an ASP.NET Core API backend.

- `Client/` is the Angular application that renders the UI and calls the backend over `/api/...`.
- `Api/` is the ASP.NET Core application that exposes HTTP endpoints and persists data.
- Data is stored in SQLite through EF Core.

## Main Projects

### `Client/`

The frontend application.

- Shows the posts list and post detail pages
- Creates and edits posts
- Creates and deletes comments
- Calls the backend through the `BlogApi` service

### `Api/`

The backend web API.

- Exposes the blog endpoints under `/api/posts`
- Uses a controller -> service -> repository structure
- Uses EF Core for database access
- Stores blog posts and comments in SQLite

### `Api.Seeder/`

A separate command-line project used to insert sample data.

- Runs after migrations have been applied
- Keeps seeding separate from normal app startup and migration execution

### `Api.Tests/`

The backend test project.

- Verifies the API through real HTTP requests
- Uses a real SQLite database per test run
- Applies real EF Core migrations before tests execute

## Request Flow

The normal request path is:

1. The browser loads the Angular app from `Client/`.
2. The Angular app sends requests to `/api/...`.
3. ASP.NET Core controllers receive the request.
4. Services handle application logic.
5. Repositories load and save data through EF Core.
6. SQLite stores the data.

## Testing Architecture

### Backend testing

Backend tests live in `Api.Tests/` and are integration-style tests.

- `WebApplicationFactory<Program>` hosts the real API in memory
- Tests call the API through real HTTP endpoints
- Each test run uses its own SQLite database file
- The test database is migrated before requests are executed

This keeps backend tests close to real application behavior.

### Frontend testing

Frontend tests live next to the Angular page components in `Client/src/app/pages/`.

- Angular TestBed configures the application for tests
- The real router is used for routed page tests
- `HttpClientTesting` mocks backend responses at the HTTP boundary
- Tests focus on user-visible page behavior, navigation, loading states, and error states

This keeps frontend tests close to real user flows without needing a running backend.

## Notes

- Migrations and seeding are separate steps by design.
- The frontend and backend live in the same repository but run as separate applications during development.
