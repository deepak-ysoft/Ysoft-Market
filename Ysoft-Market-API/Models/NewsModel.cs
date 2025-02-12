using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ysoft_Market_API.Models
{
    public class NewsModel
    {
        [Key]
        public int Id { get; set; }
        public string Type { get; set; }
        public string SubType { get; set; }
        public string Content { get; set; }
        public DateTime Date { get; set; }
        public string? Comments { get; set; }
        public string? ImagePath { get; set; }
        [NotMapped]
        public IFormFile? Photo { get; set; }
    }
}
