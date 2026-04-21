using Api.Data;
using Api.Repositories;
using Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var connectionString = ResolveSqliteConnectionString(
    builder.Configuration.GetConnectionString("BlogDatabase"),
    builder.Environment.ContentRootPath);

builder.Services.AddDbContext<BlogDbContext>(options =>
{
    options.UseSqlite(connectionString)
        .UseSeeding((context, _) => BlogDbContextSeed.Seed((BlogDbContext)context))
        .UseAsyncSeeding((context, _, cancellationToken) => BlogDbContextSeed.SeedAsync((BlogDbContext)context, cancellationToken));
});

builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IPostService, PostService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.MapControllers();

app.Run();

static string ResolveSqliteConnectionString(string? configuredConnectionString, string contentRootPath)
{
    var connectionStringBuilder = new SqliteConnectionStringBuilder(
        string.IsNullOrWhiteSpace(configuredConnectionString)
            ? "Data Source=App_Data/blog.db"
            : configuredConnectionString);

    if (string.IsNullOrWhiteSpace(connectionStringBuilder.DataSource))
    {
        connectionStringBuilder.DataSource = "App_Data/blog.db";
    }

    if (!Path.IsPathRooted(connectionStringBuilder.DataSource))
    {
        connectionStringBuilder.DataSource = Path.GetFullPath(
            Path.Combine(contentRootPath, connectionStringBuilder.DataSource));
    }

    var databaseDirectory = Path.GetDirectoryName(connectionStringBuilder.DataSource);
    if (!string.IsNullOrWhiteSpace(databaseDirectory))
    {
        Directory.CreateDirectory(databaseDirectory);
    }

    return connectionStringBuilder.ToString();
}
