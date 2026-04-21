using Api.Models;

namespace Api.Repositories;

public interface IPostRepository
{
    Task<List<Post>> GetAllAsync();

    Task<Post?> GetByIdAsync(int id);

    Task AddAsync(Post post);

    void RemovePost(Post post);

    void RemoveComment(Comment comment);

    Task SaveChangesAsync();
}
