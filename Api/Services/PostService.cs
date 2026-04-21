using Api.DTOs;
using Api.Models;
using Api.Repositories;

namespace Api.Services;

public class PostService(IPostRepository postRepository) : IPostService
{
    public async Task<IReadOnlyList<PostDto>> GetAllAsync()
    {
        var posts = await postRepository.GetAllAsync();
        return posts.Select(MapPost).ToList();
    }

    public async Task<PostDto?> GetByIdAsync(int id)
    {
        var post = await postRepository.GetByIdAsync(id);
        return post is null ? null : MapPost(post);
    }

    public async Task<PostDto> CreateAsync(CreatePostDto dto)
    {
        var now = DateTime.UtcNow;
        var post = new Post
        {
            Title = dto.Title.Trim(),
            Content = dto.Content.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        await postRepository.AddAsync(post);
        await postRepository.SaveChangesAsync();

        return MapPost(post);
    }

    public async Task<PostDto?> UpdateAsync(int id, UpdatePostDto dto)
    {
        var post = await postRepository.GetByIdAsync(id);
        if (post is null)
        {
            return null;
        }

        post.Title = dto.Title.Trim();
        post.Content = dto.Content.Trim();
        post.UpdatedAt = DateTime.UtcNow;

        await postRepository.SaveChangesAsync();

        return MapPost(post);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var post = await postRepository.GetByIdAsync(id);
        if (post is null)
        {
            return false;
        }

        postRepository.RemovePost(post);
        await postRepository.SaveChangesAsync();

        return true;
    }

    public async Task<CommentDto?> AddCommentAsync(int postId, CreateCommentDto dto)
    {
        var post = await postRepository.GetByIdAsync(postId);
        if (post is null)
        {
            return null;
        }

        var now = DateTime.UtcNow;
        var comment = new Comment
        {
            PostId = postId,
            AuthorName = dto.AuthorName.Trim(),
            Body = dto.Body.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        post.Comments.Add(comment);
        await postRepository.SaveChangesAsync();

        return MapComment(comment);
    }

    public async Task<CommentDto?> UpdateCommentAsync(int postId, int commentId, UpdateCommentDto dto)
    {
        var post = await postRepository.GetByIdAsync(postId);
        if (post is null)
        {
            return null;
        }

        var comment = post.Comments.SingleOrDefault(existingComment => existingComment.Id == commentId);
        if (comment is null)
        {
            return null;
        }

        comment.AuthorName = dto.AuthorName.Trim();
        comment.Body = dto.Body.Trim();
        comment.UpdatedAt = DateTime.UtcNow;

        await postRepository.SaveChangesAsync();

        return MapComment(comment);
    }

    public async Task<bool> DeleteCommentAsync(int postId, int commentId)
    {
        var post = await postRepository.GetByIdAsync(postId);
        if (post is null)
        {
            return false;
        }

        var comment = post.Comments.SingleOrDefault(existingComment => existingComment.Id == commentId);
        if (comment is null)
        {
            return false;
        }

        postRepository.RemoveComment(comment);
        await postRepository.SaveChangesAsync();

        return true;
    }

    private static PostDto MapPost(Post post)
    {
        return new PostDto
        {
            Id = post.Id,
            Title = post.Title,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            Comments = post.Comments
                .OrderBy(comment => comment.CreatedAt)
                .Select(MapComment)
                .ToList()
        };
    }

    private static CommentDto MapComment(Comment comment)
    {
        return new CommentDto
        {
            Id = comment.Id,
            PostId = comment.PostId,
            AuthorName = comment.AuthorName,
            Body = comment.Body,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}
