using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Seeder;

public static class BlogDbContextSeed
{
    public static void Seed(BlogDbContext context)
    {
        if (context.Posts.Any())
        {
            return;
        }

        context.Posts.AddRange(CreatePosts());
        context.SaveChanges();
    }

    public static async Task SeedAsync(BlogDbContext context, CancellationToken cancellationToken)
    {
        if (await context.Posts.AnyAsync(cancellationToken))
        {
            return;
        }

        await context.Posts.AddRangeAsync(CreatePosts(), cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static List<Post> CreatePosts()
    {
        var firstPostCreatedAt = new DateTime(2026, 1, 10, 9, 0, 0, DateTimeKind.Utc);
        var firstPostUpdatedAt = new DateTime(2026, 1, 11, 14, 30, 0, DateTimeKind.Utc);
        var secondPostCreatedAt = new DateTime(2026, 1, 15, 16, 45, 0, DateTimeKind.Utc);

        return
        [
            new Post
            {
                Title = "Starting a .NET and Angular example app",
                Content = "This sample post gives the frontend something real to fetch while the API is still intentionally simple.",
                CreatedAt = firstPostCreatedAt,
                UpdatedAt = firstPostUpdatedAt,
                Comments =
                [
                    new Comment
                    {
                        AuthorName = "Levi",
                        Body = "Seeded comments make it easier to test nested blog responses right away.",
                        CreatedAt = new DateTime(2026, 1, 10, 10, 15, 0, DateTimeKind.Utc),
                        UpdatedAt = new DateTime(2026, 1, 10, 10, 15, 0, DateTimeKind.Utc)
                    },
                    new Comment
                    {
                        AuthorName = "OpenCode",
                        Body = "This one exists so update and delete flows have multiple comments to work with.",
                        CreatedAt = new DateTime(2026, 1, 11, 15, 0, 0, DateTimeKind.Utc),
                        UpdatedAt = new DateTime(2026, 1, 11, 15, 0, 0, DateTimeKind.Utc)
                    }
                ]
            },
            new Post
            {
                Title = "SQLite keeps the backend lightweight",
                Content = "Using SQLite plus EF Core migrations is enough for an example app and keeps the setup close to the templates.",
                CreatedAt = secondPostCreatedAt,
                UpdatedAt = secondPostCreatedAt,
                Comments =
                [
                    new Comment
                    {
                        AuthorName = "Reader",
                        Body = "This is a good starter shape before adding auth or more advanced domain rules.",
                        CreatedAt = new DateTime(2026, 1, 15, 18, 0, 0, DateTimeKind.Utc),
                        UpdatedAt = new DateTime(2026, 1, 15, 18, 0, 0, DateTimeKind.Utc)
                    }
                ]
            }
        ];
    }
}
