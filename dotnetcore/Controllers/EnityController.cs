using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;
using Angular.Net.CLI.Models;
using System.IO;

namespace AngularNetCore.Controllers
{
    public class EnityController : BaseController
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly string _contentRootPath;
        public EnityController(IWebHostEnvironment hostingEnvironment, IOptions<AppSettings> appSettings, IOptions<ProSettings> proSettings) : base(hostingEnvironment, appSettings, proSettings)
        {
            _hostingEnvironment = hostingEnvironment;
            _contentRootPath = _hostingEnvironment.ContentRootPath;
        }

        [HttpGet]
        [Route("api/GetAll")]
        public IActionResult GetAll()
        {
            try
            {
                var simpsons = new List<Simpson>
                {
                    new Simpson
                    {
                        FirstName = "Hommer",
                        LastName = "Simpson"
                    },
                    new Simpson
                    {
                        FirstName = "Bart",
                        LastName = "Simpson"
                    }
                };
                return Ok(simpsons);
            }
            catch (Exception)
            {
                return null;
            }
        }

    // [HttpGet]
    // [Route("api/GetAll")]
    // async public Task<IActionResult> GetAll()
    // {
    //   try
    //   {
    //     var simpsons = new List<Simpson>
    //             {
    //                 new Simpson
    //                 {
    //                     FirstName = "Hommer",
    //                     LastName = "Simpson"
    //                 },
    //                 new Simpson
    //                 {
    //                     FirstName = "Bart",
    //                     LastName = "Simpson"
    //                 }
    //             };
    //     return await Task.FromResult(Ok(simpsons));
    //   }
    //   catch (Exception)
    //   {
    //     return null;
    //   }
    // }

        [HttpGet]
        [Route("api/GetContent")]
        public IActionResult GetContent(string fileName)
        {
            // download a specific file based on the fileName
            var dataBytes = System.IO.File.ReadAllBytes(_contentRootPath + @"\Downloads\" + fileName);
            string content = System.Text.Encoding.UTF8.GetString(dataBytes);
            content = content.Substring(0, 300) + ".........";
            return Ok(new { content });
        }

        [HttpGet]
        [Route("api/Download")]
        public IActionResult Download(string fileName)
        {
            // download a specific file
            var dataBytes = System.IO.File.ReadAllBytes(_contentRootPath + @"\Downloads\" + fileName);
            var content = new System.IO.MemoryStream(dataBytes);
            const string contentType = "application/octet-stream";
            return File(content, contentType, fileName);
        }

        [HttpPost]
        [Route("api/PostEntity")]
        public IActionResult PostEntity([FromBody] BookInfo bookInfo)
        {
            return Ok();
        }

        [HttpPost]
        [Route("api/PostCollection")]
        public IActionResult PostCollection([FromBody] List<BookInfo> testFileInfo)
        {
            return Ok();
        }

        [HttpPost]
        [Route("api/Upload")]
        public IActionResult Upload()
        {
            for (var i = 0; i < HttpContext.Request.Form.Files.Count; i++)
            {
                var uploadedFile = HttpContext.Request.Form.Files[i];
            }
            return Ok();
        }

        [HttpDelete]
        [Route("api/DeleteEntity")]
        public IActionResult DeleteEntity(string id)
        {
            return Ok();
        }

        [HttpPost]
        [Route("api/SamplePayload")]
        public IActionResult SamplePayload()
        {
            // used for e2e testing
            // compare the payload with a previous payload.
            // if the payload doesn't exist, store the payload for comparison to next 
            try
            {
                var formFile = HttpContext.Request.Form.Files[0];
                var filename = _contentRootPath + @"\Payloads\" + formFile.Name;

                if (!System.IO.File.Exists(filename))
                {
                    FileStream fs = System.IO.File.Create(filename);
                    formFile.CopyTo(fs);
                    fs.Flush();
                }
                else
                {
                    var dataBytes = System.IO.File.ReadAllBytes(_contentRootPath + @"\Snapshots\" + formFile.Name);
                    var modelStream = new System.IO.MemoryStream(dataBytes);

                    var compareStream = new MemoryStream();
                    formFile.CopyTo(compareStream);
                    compareStream.Position = 0;

                    if (modelStream.Length != compareStream.Length)
                        throw new Exception("Comparitor Failed!");

                    for (var i = 0; i < modelStream.Length; i++)
                    {
                        var modelByte = modelStream.ReadByte();
                        var compareByte = compareStream.ReadByte();
                        if (modelByte != compareByte)
                        {
                            throw new Exception("Comparitor Failed!");
                        }
                    }
                }
                return Ok();
            }
            catch (Exception e)
            {
                ExceptionHandler(this.GetType().Name, GetCallerMemberName(), e);
                return null;
            }
        }

        [HttpPost]
        [Route("api/SaveActionsQueue")]
        public IActionResult SaveActionsQueue([FromBody] ActionsFile actionsFile)
        {
            try
            {
                var filePath = _contentRootPath + @"\Actions\" + actionsFile.FileName;
                var streamWriter = System.IO.File.CreateText(filePath);
                streamWriter.WriteLine(actionsFile.ActionsQueue);
                streamWriter.Dispose();
                return Ok();
            }
            catch (System.Exception e)
            {
                return this.Content(e.Message);
            }
        }        

        [HttpGet]
        [Route("api/LoadActionsQueue")]
        public IActionResult LoadActionsQueue(string fileName)
        {
            // download a specific file based on the fileName
            var actionQueue = System.IO.File.ReadAllText(_contentRootPath + @"\Actions\" + fileName);
            var actionFile = new ActionsFile{ FileName = fileName, ActionsQueue = actionQueue };
            return Ok(actionFile);
        }
    }
}