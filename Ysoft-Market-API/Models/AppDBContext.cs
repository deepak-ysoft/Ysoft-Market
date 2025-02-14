using Microsoft.EntityFrameworkCore;

namespace Ysoft_Market_API.Models
{
    public class AppDBContext: DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
        {
        }
        public DbSet<NewsModel> News { get; set; }
    }
}
