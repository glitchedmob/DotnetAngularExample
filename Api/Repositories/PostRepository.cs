using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class PostRepository(BlogDbContext dbContext) : IPostRepository
{
    public Task<List<Post>> GetAllAsync()
    {
        return dbContext.Posts
            .Include(post => post.Comments)
            .OrderByDescending(post => post.CreatedAt)
            .ToListAsync();
    }

    public Task<Post?> GetByIdAsync(int id)
    {
        return dbContext.Posts
            .Include(post => post.Comments)
            .SingleOrDefaultAsync(post => post.Id == id);
    }

    public Task AddAsync(Post post)
    {
        return dbContext.Posts.AddAsync(post).AsTask();
    }

    public void RemovePost(Post post)
    {
        dbContext.Posts.Remove(post);
    }

    public void RemoveComment(Comment comment)
    {
        dbContext.Comments.Remove(comment);
    }

    public Task SaveChangesAsync()
    {
        return dbContext.SaveChangesAsync();
    }
}
