using Api.Data;
using Api.Seeder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

var apiProjectPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "Api"));

var configuration = new ConfigurationBuilder()
    .SetBasePath(apiProjectPath)
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile("appsettings.Development.json", optional: true)
    .AddEnvironmentVariables()
    .Build();

var connectionString = BlogDatabaseConnection.ResolveConnectionString(
    configuration.GetConnectionString(BlogDatabaseConnection.ConnectionStringName),
    apiProjectPath);

var options = new DbContextOptionsBuilder<BlogDbContext>()
    .UseSqlite(connectionString)
    .Options;

await using var dbContext = new BlogDbContext(options);

var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
if (pendingMigrations.Any())
{
    Console.Error.WriteLine("Apply migrations before running the seed command.");
    return 1;
}

await BlogDbContextSeed.SeedAsync(dbContext, CancellationToken.None);
Console.WriteLine("Database seed completed.");
return 0;
