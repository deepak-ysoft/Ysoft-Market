using Ysoft_Market_API.Models;

namespace Ysoft_Market_API.Services
{
    public interface IAccount
    {
        public Task<bool> Login(Login login);
    }
}
