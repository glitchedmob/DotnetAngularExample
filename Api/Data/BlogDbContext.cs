using Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Api.Data;

public class BlogDbContext(DbContextOptions<BlogDbContext> options) : DbContext(options)
{
    private static readonly ValueConverter<DateTime, DateTime> UtcDateTimeConverter = new(
        value => value.Kind == DateTimeKind.Utc ? value : value.ToUniversalTime(),
        value => value.Kind == DateTimeKind.Utc ? value : DateTime.SpecifyKind(value, DateTimeKind.Utc));

    public DbSet<Post> Posts => Set<Post>();

    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Post>(entity =>
        {
            entity.Property(post => post.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(post => post.Content)
                .IsRequired();

            entity.Property(post => post.CreatedAt)
                .IsRequired()
                .HasConversion(UtcDateTimeConverter);

            entity.Property(post => post.UpdatedAt)
                .IsRequired()
                .HasConversion(UtcDateTimeConverter);

            entity.HasMany(post => post.Comments)
                .WithOne(comment => comment.Post)
                .HasForeignKey(comment => comment.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.Property(comment => comment.AuthorName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(comment => comment.Body)
                .IsRequired();

            entity.Property(comment => comment.CreatedAt)
                .IsRequired()
                .HasConversion(UtcDateTimeConverter);

            entity.Property(comment => comment.UpdatedAt)
                .IsRequired()
                .HasConversion(UtcDateTimeConverter);
        });
    }
}
