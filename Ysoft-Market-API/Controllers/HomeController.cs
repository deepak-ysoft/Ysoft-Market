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
                var FeaturedNewsLarge = _context.News.Where(x => x.Type == "Featured News" && x.isDelete == false && x.SubType == "Large").ToList();
                var FeaturedNewsMedium = _context.News.Where(x => x.Type == "Featured News" && x.isDelete == false && x.SubType == "Medium").ToList();
                var FeaturedNewsSmall = _context.News.Where(x => x.Type == "Featured News" && x.isDelete == false && x.SubType == "Small").ToList();
                var LatestNewsLarge = _context.News.Where(x => x.Type == "Latest News" && x.isDelete == false && x.SubType == "Large").ToList();
                var LatestNewsSmall = _context.News.Where(x => x.Type == "Latest News" && x.isDelete == false && x.SubType == "Small").ToList();
                var PopularNewsLarge = _context.News.Where(x => x.Type == "Popular News" && x.isDelete == false && x.SubType == "Large").ToList();
                var PopularNewsSmall = _context.News.Where(x => x.Type == "Popular News" && x.isDelete == false && x.SubType == "Small").ToList();
                var allNews = _context.News.Where(x => x.isDelete == false).ToList();
                var allDeletedNews = _context.News.Where(x => x.isDelete == true).ToList();
                return Ok(new { FeaturedNewsLarge, FeaturedNewsMedium, FeaturedNewsSmall, LatestNewsLarge, LatestNewsSmall, PopularNewsLarge, PopularNewsSmall, allNews, allDeletedNews });
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
        [HttpPost("AddUpdateNews")]
        public async Task<IActionResult> AddUpdateNews([FromForm] NewsModel news)
        {
            if (!ModelState.IsValid) // Check model state
                return BadRequest(ModelState);
            try
            {
                if (news.Id == 0 || news.Id == null)
                {

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
        /// To show selected data
        /// </summary>
        /// <param name="selectedNewsIds"></param>
        /// <returns></returns>
        [HttpPost("UpdateSelection")]
        public async Task<IActionResult> UpdateSelection([FromBody] int newsId)
        {
            var news = await _context.News.FindAsync(newsId);
            if (news == null)
            {
                return NotFound(new { success = false, message = "News item not found." });
            }

            // Check existing counts to prevent exceeding limits
            var allNews = await _context.News.ToListAsync();
            var newLargeF = allNews.Count(x => x.Show == true && x.Type == "Featured News" && x.SubType == "Large");
            var newMediumF = allNews.Count(x => x.Show == true && x.Type == "Featured News" && x.SubType == "Medium");
            var newSmallF = allNews.Count(x => x.Show == true && x.Type == "Featured News" && x.SubType == "Small");
            var newLargeL = allNews.Count(x => x.Show == true && x.Type == "Latest News" && x.SubType == "Large");
            var newLargeP = allNews.Count(x => x.Show == true && x.Type == "Popular News" && x.SubType == "Large");

            // If trying to add this news, check limits
            if ((bool)!news.Show)
            {
                if (news.Type == "Featured News" && news.SubType == "Large" && newLargeF >= 2)
                    return Ok(new { success = false, message = "You can add only two Large in Featured News." });
                if (news.Type == "Featured News" && news.SubType == "Medium" && newMediumF >= 2)
                    return Ok(new { success = false, message = "You can add only two Medium in Featured News." });
                if (news.Type == "Featured News" && news.SubType == "Small" && newSmallF >= 6)
                    return Ok(new { success = false, message = "You can add only six Small in Featured News." });
                if (news.Type == "Latest News" && news.SubType == "Large" && newLargeL >= 1)
                    return Ok(new { success = false, message = "You can add only one Large in Latest News." });
                if (news.Type == "Popular News" && news.SubType == "Large" && newLargeP >= 1)
                    return Ok(new { success = false, message = "You can add only one Large in Popular News." });

                // Delete and Re-add only for the last selected item
                _context.News.Remove(news);
                await _context.SaveChangesAsync(); // Commit deletion first

                var newNews = new NewsModel
                {
                    Date = news.Date,
                    Type = news.Type,
                    SubType = news.SubType,
                    Content = news.Content,
                    Comments = news.Comments,
                    Show = true,
                    isDelete = false,
                    ImagePath = news.ImagePath
                };
                await _context.News.AddAsync(newNews);

                //// If within limits, toggle `Show` to true
                //news.Show = true;
            }
            else
            {
                // If deselected, toggle `Show` to false
                news.Show = false;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Updated!" });
        }

        /// <summary>
        ///  Detele news
        /// </summary>
        /// <param name="id"> News id</param>
        /// <returns>message</returns>
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
