using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Ysoft_Market_API.Models;
using Ysoft_Market_API.Services;

namespace Ysoft_Market_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly IHome _service;
        private readonly AppDBContext _context;
        public HomeController(IHome service, AppDBContext context)
        {
            _service = service;
            _context = context;
        }

        /// <summary>
        /// Get all news
        /// </summary>
        /// <returns>three list</returns>
        [HttpGet("GetAllNews")]
        public async Task<IActionResult> GetAllNews()
        {
            try
            {
                var FeaturedNewsLarge = _context.News.Where(x => x.Type == "Featured News" && x.SubType == "Large").ToList();
                var FeaturedNewsMedium = _context.News.Where(x => x.Type == "Featured News" && x.SubType == "Medium").ToList();
                var FeaturedNewsSmall = _context.News.Where(x => x.Type == "Featured News" && x.SubType == "Small").ToList();
                var LatestNewsLarge = _context.News.Where(x => x.Type == "Latest News" && x.SubType == "Large").ToList();
                var LatestNewsSmall = _context.News.Where(x => x.Type == "Latest News" && x.SubType == "Small").ToList();
                var PopularNewsLarge = _context.News.Where(x => x.Type == "Popular News" && x.SubType == "Large").ToList();
                var PopularNewsSmall = _context.News.Where(x => x.Type == "Popular News" && x.SubType == "Small").ToList();
                return Ok(new { FeaturedNewsLarge, FeaturedNewsMedium, FeaturedNewsSmall, LatestNewsLarge, LatestNewsSmall, PopularNewsLarge, PopularNewsSmall });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", error = ex.Message });
            }
        }


        /// <summary>
        /// Add or update news
        /// </summary>
        /// <param name="news">NewsModel Model object</param>
        /// <returns>message</returns>
        [Authorize]
        [HttpPost("AddUpdateNews")]
        public async Task<IActionResult> AddUpdateNews([FromForm] NewsModel news)
        {
            if (!ModelState.IsValid) // Check model state
                return BadRequest(ModelState);
            try
            {
                if (news.Id == 0 || news.Id == null)
                {
                    var FeaturedNewsLarge = _context.News.Where(x => x.Type == "Featured News" && x.SubType == "Large").ToList();
                    var FeaturedNewsMedium = _context.News.Where(x => x.Type == "Featured News" && x.SubType == "Medium").ToList();
                    var FeaturedNewsSmall = _context.News.Where(x => x.Type == "Featured News" && x.SubType == "Small").ToList();
                    var LatestNewsLarge = _context.News.Where(x => x.Type == "Latest News" && x.SubType == "Large").ToList();
                    var PopularNewsLarge = _context.News.Where(x => x.Type == "Popular News" && x.SubType == "Large").ToList();

                    if (FeaturedNewsLarge.Count >= 2 && news.Type == "Featured News" && news.SubType == "Large")
                        return Ok(new { success = false, message = "You can add only two large in Featured News." });
                    if (FeaturedNewsMedium.Count >= 2 && news.Type == "Featured News" && news.SubType == "Medium")
                        return Ok(new { success = false, message = "You can add only two medium in Featured News." });
                    if (FeaturedNewsSmall.Count >= 6 && news.Type == "Featured News" && news.SubType == "Small")
                        return Ok(new { success = false, message = "You can add only six small in Featured News." });
                    if (LatestNewsLarge.Count >= 1 && news.Type == "Latest News" && news.SubType == "Large")
                        return Ok(new { success = false, message = "You can add only One large in Latest News." });
                    if (PopularNewsLarge.Count >= 1 && news.Type == "Popular News" && news.SubType == "Large")
                        return Ok(new { success = false, message = "You can add only One large in Popular News." });
                    if ((news.Type == "Latest News" || news.Type == "Popular News") && news.SubType == "Medium")
                        return Ok(new { success = false, message = "Medium Size Image Not Available In Latest And Popular News." });
                }

                var res = await _service.AddUpdateNews(news); // Add or update news
                if (res) // If news added/updated successfully
                    return Ok(new { success = true, message = "News added/updated successfully." });
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", error = ex.Message });
            }
        }

        /// <summary>
        ///  Detele news
        /// </summary>
        /// <param name="id"> News id</param>
        /// <returns>message</returns>
        [Authorize]
        [HttpDelete("DeleteNews/{id}")]
        public async Task<IActionResult> DeleteNews(int id)
        {
            try
            {
                var res = await _service.DeleteNews(id); // Delete news
                if (res) // If news deleted successfully
                    return Ok(new { success = true, message = "News deleted successfully." });
                return StatusCode(500, new { success = false, message = "An unexpected error occurred." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", error = ex.Message });
            }
        }
    }
}
