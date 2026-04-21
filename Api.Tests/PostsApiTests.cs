using System.Net;
using System.Net.Http.Json;
using Api.DTOs;
using Api.Models;
using Api.Tests.Infrastructure;

namespace Api.Tests;

public class PostsApiTests
{
    [Fact]
    public async Task GetPostsReturnsEmptyCollectionForFreshDatabase()
    {
        await using var factory = new TestApiFactory();
        await factory.InitializeAsync();
        using var client = factory.CreateClient();

        var posts = await client.GetFromJsonAsync<List<PostDto>>("/api/posts");

        Assert.NotNull(posts);
        Assert.Empty(posts);
    }

    [Fact]
    public async Task CreatePostPersistsAndReturnsCreatedResource()
    {
        await using var factory = new TestApiFactory();
        await factory.InitializeAsync();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/posts", new
        {
            title = "Integration testing with SQLite",
            content = "This request should create a post in a migrated SQLite database."
        });

        var createdPost = await response.Content.ReadFromJsonAsync<PostDto>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(createdPost);
        Assert.True(createdPost.Id > 0);
        Assert.Equal("Integration testing with SQLite", createdPost.Title);
        Assert.Equal(createdPost.CreatedAt, createdPost.UpdatedAt);
    }

    [Fact]
    public async Task GetPostByIdReturnsInsertedPostWithComments()
    {
        await using var factory = new TestApiFactory();
        await factory.InitializeAsync();
        await factory.ExecuteDbContextAsync(dbContext =>
        {
            dbContext.Posts.Add(new Post
            {
                Title = "Stored post",
                Content = "Inserted directly for integration testing.",
                CreatedAt = new DateTime(2026, 2, 1, 8, 30, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 2, 1, 9, 0, 0, DateTimeKind.Utc),
                Comments =
                [
                    new Comment
                    {
                        AuthorName = "Tester",
                        Body = "A seeded-by-test comment.",
                        CreatedAt = new DateTime(2026, 2, 1, 8, 45, 0, DateTimeKind.Utc),
                        UpdatedAt = new DateTime(2026, 2, 1, 8, 45, 0, DateTimeKind.Utc)
                    }
                ]
            });

            return Task.CompletedTask;
        });
        using var client = factory.CreateClient();

        var post = await client.GetFromJsonAsync<PostDto>("/api/posts/1");

        Assert.NotNull(post);
        Assert.Equal("Stored post", post.Title);
        Assert.Single(post.Comments);
        Assert.Equal("Tester", post.Comments[0].AuthorName);
    }

    [Fact]
    public async Task UpdatePostChangesContentAndUpdatedAt()
    {
        await using var factory = new TestApiFactory();
        await factory.InitializeAsync();
        await factory.ExecuteDbContextAsync(dbContext =>
        {
            dbContext.Posts.Add(new Post
            {
                Title = "Original title",
                Content = "Original content",
                CreatedAt = new DateTime(2026, 2, 2, 10, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 2, 2, 10, 0, 0, DateTimeKind.Utc)
            });

            return Task.CompletedTask;
        });
        using var client = factory.CreateClient();

        var response = await client.PutAsJsonAsync("/api/posts/1", new
        {
            title = "Updated title",
            content = "Updated content"
        });

        var updatedPost = await response.Content.ReadFromJsonAsync<PostDto>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(updatedPost);
        Assert.Equal("Updated title", updatedPost.Title);
        Assert.Equal("Updated content", updatedPost.Content);
        Assert.True(updatedPost.UpdatedAt >= updatedPost.CreatedAt);
    }

    [Fact]
    public async Task CommentCrudEndpointsWorkAgainstRealDatabase()
    {
        await using var factory = new TestApiFactory();
        await factory.InitializeAsync();
        await factory.ExecuteDbContextAsync(dbContext =>
        {
            dbContext.Posts.Add(new Post
            {
                Title = "Comment target",
                Content = "A post that will receive comments.",
                CreatedAt = new DateTime(2026, 2, 3, 11, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 2, 3, 11, 0, 0, DateTimeKind.Utc)
            });

            return Task.CompletedTask;
        });
        using var client = factory.CreateClient();

        var createResponse = await client.PostAsJsonAsync("/api/posts/1/comments", new
        {
            authorName = "Commenter",
            body = "Created through the API"
        });
        var createdComment = await createResponse.Content.ReadFromJsonAsync<CommentDto>();

        var updateResponse = await client.PutAsJsonAsync($"/api/posts/1/comments/{createdComment!.Id}", new
        {
            authorName = "Commenter",
            body = "Updated through the API"
        });
        var updatedComment = await updateResponse.Content.ReadFromJsonAsync<CommentDto>();

        var deleteResponse = await client.DeleteAsync($"/api/posts/1/comments/{createdComment.Id}");
        var postAfterDelete = await client.GetFromJsonAsync<PostDto>("/api/posts/1");

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.NotNull(updatedComment);
        Assert.Equal("Updated through the API", updatedComment.Body);
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.NotNull(postAfterDelete);
        Assert.Empty(postAfterDelete.Comments);
    }

    [Fact]
    public async Task MissingPostReturnsNotFound()
    {
        await using var factory = new TestApiFactory();
        await factory.InitializeAsync();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/posts/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
