using Api.DTOs;
using Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController(IPostService postService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PostDto>>> GetPosts()
    {
        var posts = await postService.GetAllAsync();
        return Ok(posts);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PostDto>> GetPostById(int id)
    {
        var post = await postService.GetByIdAsync(id);
        return post is null ? NotFound() : Ok(post);
    }

    [HttpPost]
    public async Task<ActionResult<PostDto>> CreatePost(CreatePostDto dto)
    {
        var post = await postService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetPostById), new { id = post.Id }, post);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PostDto>> UpdatePost(int id, UpdatePostDto dto)
    {
        var post = await postService.UpdateAsync(id, dto);
        return post is null ? NotFound() : Ok(post);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var deleted = await postService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{postId:int}/comments")]
    public async Task<ActionResult<CommentDto>> CreateComment(int postId, CreateCommentDto dto)
    {
        var comment = await postService.AddCommentAsync(postId, dto);
        return comment is null
            ? NotFound()
            : CreatedAtAction(nameof(GetPostById), new { id = postId }, comment);
    }

    [HttpPut("{postId:int}/comments/{commentId:int}")]
    public async Task<ActionResult<CommentDto>> UpdateComment(int postId, int commentId, UpdateCommentDto dto)
    {
        var comment = await postService.UpdateCommentAsync(postId, commentId, dto);
        return comment is null ? NotFound() : Ok(comment);
    }

    [HttpDelete("{postId:int}/comments/{commentId:int}")]
    public async Task<IActionResult> DeleteComment(int postId, int commentId)
    {
        var deleted = await postService.DeleteCommentAsync(postId, commentId);
        return deleted ? NoContent() : NotFound();
    }
}
