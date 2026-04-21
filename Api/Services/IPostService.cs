using Api.DTOs;

namespace Api.Services;

public interface IPostService
{
    Task<IReadOnlyList<PostDto>> GetAllAsync();

    Task<PostDto?> GetByIdAsync(int id);

    Task<PostDto> CreateAsync(CreatePostDto dto);

    Task<PostDto?> UpdateAsync(int id, UpdatePostDto dto);

    Task<bool> DeleteAsync(int id);

    Task<CommentDto?> AddCommentAsync(int postId, CreateCommentDto dto);

    Task<CommentDto?> UpdateCommentAsync(int postId, int commentId, UpdateCommentDto dto);

    Task<bool> DeleteCommentAsync(int postId, int commentId);
}
