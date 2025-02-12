using System.ComponentModel.DataAnnotations;

namespace Ysoft_Market_API.Models
{
    public class Login
    {
        [Key]
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
