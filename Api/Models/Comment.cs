namespace Api.Models;

public class Comment
{
    public int Id { get; set; }

    public int PostId { get; set; }

    public string AuthorName { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Post? Post { get; set; }
}
