namespace Ysoft_Market_API.Services
{
    public interface IJwt
    {
        public string GenerateJwtToken(string userId);
    }
}
