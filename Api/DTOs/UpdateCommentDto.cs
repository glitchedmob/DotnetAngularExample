using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class UpdateCommentDto
{
    [Required]
    [StringLength(100)]
    public string AuthorName { get; init; } = string.Empty;

    [Required]
    public string Body { get; init; } = string.Empty;
}
