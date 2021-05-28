using System;
using System.Collections.Generic;
using System.Diagnostics;
using Angular.Net.CLI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;

namespace AngularNetCore.Controllers
{
    [Route("api/[controller]")]
    public class EventController : BaseController
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        public EventController(IWebHostEnvironment hostingEnvironment, IOptions<AppSettings> appSettings, IOptions<ProSettings> proSettings) : base(hostingEnvironment, appSettings, proSettings)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpPost]
        [Route("ThrowException")]
        public IActionResult ThrowException([FromBody] EventProperties evt)
        {
            try
            {
                throw new Exception(evt.exception);
            }
            catch (Exception e)
            {
                ExceptionHandler(this.GetType().Name, GetCallerMemberName(), e);
                return null;
            }
        }

        [HttpPost]
        [Route("PostLogEntry")]
        public IActionResult PostLogEntry([FromBody] EventProperties evt)
        {
            try
            {
                LogEventEntry(evt);
                return Ok();
            }
            catch (Exception e)
            {
                ExceptionHandler(this.GetType().Name, GetCallerMemberName(), e);
                return null;
            }
        }

        [HttpGet]
        [Route("GetLogEntries")]
        public IActionResult GetLogEntries()
        {
            try
            {
                const string eventLogName = "Application";
                List<EventLogEntry> eventLogEntries = new List<EventLogEntry>();
                if (EventLog.Exists(eventLogName))
                {
                    var appLog = EventLog.GetEventLogs().ToList().First(x => x.Log == eventLogName);
                    eventLogEntries = appLog.Entries.Cast<EventLogEntry>().
                        Where(x => x.ReplacementStrings.Length > 0 && x.ReplacementStrings[0] == _applicationLog).Take(100).Reverse().ToList();
                }
                return Ok(eventLogEntries);
            }
            catch (Exception e)
            {
                ExceptionHandler(this.GetType().Name, GetCallerMemberName(), e);
                return null;
            }
        }
    }
}
