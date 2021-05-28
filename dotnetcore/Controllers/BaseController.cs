using System;
using System.Net;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;
using Angular.Net.CLI.Models;
using System.Diagnostics;
using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting;

namespace AngularNetCore.Controllers
{
    public class CustomExceptionFilterAttribute : ExceptionFilterAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            var exception = context.Exception;
            context.Result = new ContentResult
            {
                Content = $"{exception.Message}",
                ContentType = "test/plain",
                StatusCode = (int?)HttpStatusCode.BadRequest
            };
        }
    }

    [CustomExceptionFilterAttribute]
    public class BaseController : Controller
    {
        protected string _applicationLog;
        protected AppSettings _appSettings; // this collection is passed back to the client
        protected ProSettings _proSettings; // this collection stays on the server

        public BaseController(IWebHostEnvironment hostingEnvironment, IOptions<AppSettings> appSettings, IOptions<ProSettings> proSettings)
        {
            _appSettings = appSettings.Value;
            _proSettings = proSettings.Value;
            _applicationLog = "Application Log: " + hostingEnvironment.ApplicationName;
            ManageSettings();
        }

        private void ManageSettings()
        {
            _appSettings.aspNetCoreVersion = typeof(Controller).Assembly.GetName().Version.ToString();
            _appSettings.debug = true;
#if RELEASE
            _appSettings.debug = false;
#endif
            // The logic is: if the proSettings exist, use those, if not, use appSettings
            // either way, mask the appSettings before being passed to the client
            
            // updating for the client
            if (_proSettings.googleMapKey != null)
                _appSettings.googleMapKey = _proSettings.googleMapKey;
            // updating for the server            
            if (_proSettings.connectionString == null)
                _proSettings.connectionString = _appSettings.connectionString;
            if (_proSettings.smtpHost == null)
                _proSettings.smtpHost = _appSettings.smtpHost;
            if (_proSettings.smtpPort == 0)
                _proSettings.smtpPort = _appSettings.smtpPort;
            if (_proSettings.smtpPw == null)
                _proSettings.smtpPw = _appSettings.smtpPw;
            if (_proSettings.smtpReply == null)
                _proSettings.smtpReply = _appSettings.smtpReply;
            if (_proSettings.smtpUn == null)
                _proSettings.smtpUn = _appSettings.smtpUn;
            if (_proSettings.smsUn == null)
                _proSettings.smsUn = _appSettings.smsUn;
            if (_proSettings.smsPw == null)
                _proSettings.smsPw = _appSettings.smsPw;
            if (_proSettings.smsFrom == null)
                _proSettings.smsFrom = _appSettings.smsFrom;

            // Mask sensitive data you don't want to pass to the client
            _appSettings.connectionString = "???";
            _appSettings.smtpHost = "???";
            _appSettings.smtpPort = 0;
            _appSettings.smtpPw = "???";
            _appSettings.smtpReply = "???";
            _appSettings.smtpUn = "???";
            _appSettings.smsUn = "???";
            _appSettings.smsPw = "???";
            _appSettings.smsFrom = "???";
        }

        protected void ExceptionHandler(string className, string methodName, Exception e)
        {
            LogException(e);
        }

        protected static string GetCallerMemberName([CallerMemberName]string name = "")
        {
            return name;
        }

        protected void LogException(Exception exception)
        {
            var e = exception;
            var evt = new EventProperties
            {
                message = exception.Message,
                entryType = (int)EventLogEntryType.Error
            };

            var stringCollection = new List<string>
            {
                _applicationLog
            };

            do
            {
                stringCollection.Add("Exception Message: " + exception.Message);
                stringCollection.Add("Stack Trace: " + exception.StackTrace);
                exception = exception.InnerException;
            } while (exception != null);

            string[] replacementStrings = stringCollection.ToArray();
            EventLog.WriteEvent("Application", new EventInstance(0, 0, (EventLogEntryType)evt.entryType), replacementStrings);
            
            throw new Exception(e.ToString());
        }

        protected void LogEventEntry(EventProperties evt)
        {
            string[] replacementStrings = {
                _applicationLog,
                "Message: " + evt.message
            };
            EventLog.WriteEvent("Application", new EventInstance(0, 0, (EventLogEntryType)evt.entryType), replacementStrings);
        }
    }
}