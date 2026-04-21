using Microsoft.Data.Sqlite;

namespace Api.Data;

public static class BlogDatabaseConnection
{
    public const string ConnectionStringName = "BlogDatabase";
    public const string DefaultDataSource = "App_Data/blog.db";

    public static string ResolveConnectionString(string? configuredConnectionString, string contentRootPath)
    {
        var connectionStringBuilder = new SqliteConnectionStringBuilder(
            string.IsNullOrWhiteSpace(configuredConnectionString)
                ? $"Data Source={DefaultDataSource}"
                : configuredConnectionString);

        if (string.IsNullOrWhiteSpace(connectionStringBuilder.DataSource))
        {
            connectionStringBuilder.DataSource = DefaultDataSource;
        }

        if (!Path.IsPathRooted(connectionStringBuilder.DataSource))
        {
            connectionStringBuilder.DataSource = Path.GetFullPath(
                Path.Combine(contentRootPath, connectionStringBuilder.DataSource));
        }

        var databaseDirectory = Path.GetDirectoryName(connectionStringBuilder.DataSource);
        if (!string.IsNullOrWhiteSpace(databaseDirectory))
        {
            Directory.CreateDirectory(databaseDirectory);
        }

        return connectionStringBuilder.ToString();
    }
}
