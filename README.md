# DotnetAngularExample

See [ARCHITECTURE.md](ARCHITECTURE.md) for a high-level overview of the application and test setup.

## Global Tools

Install these globally on your machine:

- .NET SDK 10
- Node.js 24+

## Install And Setup

From the repository root:

```bash
dotnet tool restore
dotnet restore DotnetAngularExample.slnx
npm install --prefix Client
dotnet dotnet-ef database update --project Api/Api.csproj --startup-project Api/Api.csproj
dotnet run --project Api.Seeder/Api.Seeder.csproj
```

The database setup is split into two steps:

- `dotnet dotnet-ef database update` applies migrations
- `dotnet run --project Api.Seeder/Api.Seeder.csproj` inserts sample data

## Run

Run the API:

```bash
dotnet run --project Api/Api.csproj
```

Run the Angular client in a second terminal:

```bash
npm start --prefix Client
```

## Test

Run backend tests:

```bash
dotnet test Api.Tests/Api.Tests.csproj
```

Run frontend tests:

```bash
npm test --prefix Client
```
