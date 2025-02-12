using Microsoft.EntityFrameworkCore;
using Ysoft_Market_API.Models;
using Ysoft_Market_API.Services;

namespace Ysoft_Market_API.Content
{
    public class HomeContent : IHome
    {
        private readonly AppDBContext _context;
        private readonly IWebHostEnvironment _env;
        public HomeContent(AppDBContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }


        public async Task<bool> AddUpdateNews(NewsModel news)
        {
            if (news.Id == 0) // If news id is 0 then add new news
            {
                news.ImagePath = UploadImage(news.Photo); // Upload the image
                _context.News.Add(news);
            }
            else // If news id is not 0 then update news
            {
                var previuseNews = await _context.News.FirstOrDefaultAsync(x => x.Id == news.Id);

                if (news.Photo != null)
                {
                    if(previuseNews.ImagePath != null)
                        await DeleteImageAsync(previuseNews.ImagePath); // Delete the old image
                    news.ImagePath = UploadImage(news.Photo); // Upload the new image
                }
                else
                {

                    news.ImagePath = previuseNews.ImagePath;
                }
                var existingEntity = _context.ChangeTracker.Entries<NewsModel>().FirstOrDefault(e => e.Entity.Id == news.Id); // Get existing candidate

                if (existingEntity != null) // If existing candidate is not null
                {
                    _context.Entry(existingEntity.Entity).State = EntityState.Detached; // Detach the existing candidate
                }
                _context.News.Update(news);
            }
            int res = await _context.SaveChangesAsync();
            if (res > 0)
                return true;
            return false;
        }

        public async Task<bool> DeleteNews(int id)
        {
            _context.News.Remove(_context.News.FirstOrDefault(x => x.Id == id)); // Remove the news
            int res = await _context.SaveChangesAsync();
            if (res > 0)
                return true;
            return false;
        }

        // To upload user image when user select image
        private string UploadImage(IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
            { return null; }
            string shortGuid = Guid.NewGuid().ToString().Substring(0, 8); // Generate a short GUID
            string timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss"); // Get the current timestamp
            string originalName = Path.GetFileNameWithoutExtension(photo.FileName); // Get the original file name wiothout extension

            // Shorten the original name if it’s longer than 10 characters
            string shortenedName = originalName.Length > 10 ? originalName.Substring(0, 10) : originalName;

            string folder = Path.Combine(_env.ContentRootPath, "uploads\\newsImg"); // Combine paths
            string fileName = $"{shortGuid}_{timestamp}_{shortenedName}{Path.GetExtension(photo.FileName)}"; // Generate the file name
            string filePath = Path.Combine(folder, fileName); // Combine paths 
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                photo.CopyTo(fileStream); // Copy the file to the file stream
            }

            return fileName;
        }
        public async Task DeleteImageAsync(string ImagePath) // Marked as async
        {
            string fileName = Path.GetFileName(ImagePath); // Get the file name
            var filePath = Path.Combine(_env.ContentRootPath + "\\uploads\\newsImg\\", fileName ?? string.Empty); // Combine paths

            // Check if the newsloyee exists and the file path is not the default image
            if (File.Exists(filePath))
            {
                File.Delete(filePath); // Delete the file
                await _context.SaveChangesAsync(); // Use async version of SaveChanges
            }
        }

    }
}
