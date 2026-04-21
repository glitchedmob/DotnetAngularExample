using System.Text.Json.Serialization;

namespace Api.DTOs;

public class PostDto
{
    public int Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Content { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }

    public DateTime UpdatedAt { get; init; }

    [JsonPropertyOrder(99)]
    public IReadOnlyList<CommentDto> Comments { get; init; } = [];
}
