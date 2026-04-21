namespace Api.DTOs;

public class CommentDto
{
    public int Id { get; init; }

    public int PostId { get; init; }

    public string AuthorName { get; init; } = string.Empty;

    public string Body { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }

    public DateTime UpdatedAt { get; init; }
}
