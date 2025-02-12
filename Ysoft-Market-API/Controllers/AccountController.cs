using Microsoft.AspNetCore.Mvc;
using Ysoft_Market_API.Models;
using Ysoft_Market_API.Services;

namespace Ysoft_Market_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly Services.IAccount _service;
        private readonly AppDBContext _context;
        private readonly IJwt _authService;
        public AccountController( Services.IAccount service,AppDBContext context,IJwt authService)
        {
            _context = context;
            _service = service;
            _authService = authService;
        }
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] Login model)
        {
            try
            {
                if (await _service.Login(model)) // Check user is exist or not 
                {
                    var userData = _context.Login.FirstOrDefault(x => x.Email.ToLower() == model.Email.ToLower()); // Get UserData by email
                    if (userData == null)
                    {
                        return NotFound("User not found.");
                    }
                    var token = _authService.GenerateJwtToken(userData?.Id.ToString()); // Call AuthService
                    return Ok(new
                    {
                        success = true,
                        Token = token
                    });
                }
                else
                {
                    return Ok(new {success= false});
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", error = ex.Message });
            }
        }
    }
}
