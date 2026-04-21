using Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Api.Tests.Infrastructure;

public sealed class TestApiFactory : WebApplicationFactory<Program>, IAsyncDisposable
{
    private readonly string databaseDirectory = Path.Combine(Path.GetTempPath(), "dotnet-angular-example-tests", Guid.NewGuid().ToString("N"));
    private readonly string databasePath;

    public TestApiFactory()
    {
        databasePath = Path.Combine(databaseDirectory, "blog-tests.db");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<BlogDbContext>));
            services.RemoveAll(typeof(BlogDbContext));

            services.AddDbContext<BlogDbContext>(options =>
            {
                options.UseSqlite($"Data Source={databasePath}");
            });
        });
    }

    public async Task InitializeAsync()
    {
        Directory.CreateDirectory(databaseDirectory);

        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BlogDbContext>();
        await dbContext.Database.MigrateAsync();
    }

    public async Task ExecuteDbContextAsync(Func<BlogDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BlogDbContext>();
        await action(dbContext);
        await dbContext.SaveChangesAsync();
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();

        if (Directory.Exists(databaseDirectory))
        {
            Directory.Delete(databaseDirectory, recursive: true);
        }
    }
}
