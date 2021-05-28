using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;
using Angular.Net.CLI.Models;

namespace AngularNetCore.Controllers
{
    public class AuthController : BaseController
    {
        const string authToken = "please accept this small token of my appreciation";
        Creds creds = new Creds{ Email = "user@angularstudio.com", Password = "passw00d!" };
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly string _contentRootPath;
        public AuthController(IWebHostEnvironment hostingEnvironment, IOptions<AppSettings> appSettings, IOptions<ProSettings> proSettings) : base(hostingEnvironment, appSettings, proSettings)
        {
            _hostingEnvironment = hostingEnvironment;
            _contentRootPath = _hostingEnvironment.ContentRootPath;
        }

        [HttpGet]
        [Route("api/GetKeys")]
        public IActionResult GetKeys(string authToken)
        {
            var v = typeof(Controller).Assembly.GetName().Version.ToString();
            var o =_appSettings.aspNetCoreVersion;
            if(authToken == AuthController.authToken){
                    Keys keys = new Keys{ GoogleMapKey = "AIzaSyAeRDZev0mERgeKtpbJ6fhTGz-Os_2t0qg",
                    SmsFrom = "14178156848",
                    SmsPw = "ZGRvbm92YW46RUM0QzkxMjAtNTg1Ri02QkNGLTI3RDUtMzBGQ0Y3RThEM0Ix",
                    aspNetCoreVersion = typeof(Controller).Assembly.GetName().Version.ToString()
                };
                return Ok(keys);                
            }else
            {
                return BadRequest("What are you trying to pull off here?");                
            }
        }

        [HttpPost]
        [Route("api/SignIn")]
        public IActionResult SignIn([FromBody] Creds creds)
        {
            if(creds.Email == this.creds.Email && creds.Password == this.creds.Password){
                return Ok(new { authToken });                
            } else {
                return BadRequest("Wrong Email or Password! PLease try again.");
            }
        }
    }
}