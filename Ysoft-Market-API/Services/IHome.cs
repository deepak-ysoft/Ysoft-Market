using Ysoft_Market_API.Models;

namespace Ysoft_Market_API.Services
{
    public interface IHome
    {
        public Task<bool> AddUpdateNews(NewsModel news);
        public Task<bool> DeleteNews(int id);
    }
}
