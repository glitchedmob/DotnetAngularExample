using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class UpdatePostDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; init; } = string.Empty;

    [Required]
    public string Content { get; init; } = string.Empty;
}
