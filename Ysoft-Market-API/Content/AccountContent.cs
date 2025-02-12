using Microsoft.EntityFrameworkCore;
using Ysoft_Market_API.Models;
using Ysoft_Market_API.Services;

namespace Ysoft_Market_API.Content
{
    public class AccountContent:IAccount
    {
        private readonly AppDBContext _db;
        public AccountContent(AppDBContext db)
        {
            _db = db;
        }


        // Check user is valid or not
        public async Task<bool> Login(Login model)
        {
            var user = await _db.Login.SingleOrDefaultAsync(u => u.Email == model.Email && u.Password == model.Password); // Check user is exist or not
            if (user != null)
                return true;
            return false;
        }
    }
}
