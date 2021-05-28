using System.Collections.Generic;
// TODO: some of these models are obsolete
namespace Angular.Net.CLI.Models
{
    public class ChannelMessage
    {
        public string SendersName { get; set; }
        public string Message { get; set; }
    }

    public class ChannelRegistration
    {
        public string Id { get; set; }
        public long LastAck { get; set; }
        public string Name { get; set; }
        public string Message { get; set; }
        public long MessageTime { get; set; }
        public List<string> Subscriptions { get; set; }
    }

    public class ApiVersions
    {
        public string typeScript { get; set; }
        public string nodeJs { get; set; }
        public string v8Engine { get; set; }
        public string angular { get; set; }
        public string rxJs { get; set; }
        public string moment { get; set; }
        public string coreJs { get; set; }
        public string zoneJs { get; set; }
        public string googleMaps { get; set; }
    }

    public class AppSettings
    {
        public string launchPath { get; set; }
        public bool debug { get; set; }
        public bool testing { get; set; }
        public bool onlineStatus { get; set; }
        public string connectionString { get; set; }
        public string buildVersion { get; set; }
        public int splashTime { get; set; }
        public string googleMapKey { get; set; }
        public string smtpReply { get; set; }
        public string smtpHost { get; set; }
        public int smtpPort { get; set; }
        public string smtpUn { get; set; }
        public string smtpPw { get; set; }
        public string smsUn { get; set; }
        public string smsPw { get; set; }
        public string smsFrom { get; set; }
        public string cellCarriers { get; set; }
        public string aspNetCoreVersion { get; set; }
        public ApiVersions apiVersions { get; set; }
    }

    public class ProSettings : AppSettings
    {
    }

    public class CellCarrier
    {
        public string name { get; set; }
        public string smsProfile { get; set; }
    }

    public enum BuildType
    {
        native,
        pwa,
        popup,
        tab
    }

    public class AngularProject
    {
        public string visualProject { get; set; }
        public string name { get; set; }
        public bool buildEnabled { get; set; }
        public BuildType buildType { get; set; }
        public bool production { get; set; }
        public string distFolder { get; set; }
        public string angularModule { get; set; }
        public string angularRoot { get; set; }
        public string angularProjectDir { get; set; }
        public bool showPanel { get; set; }
    }

    public class BuildResponse
    {
        public string payloadType { get; set; }
        public string consoleText { get; set; }
        public string versionNo { get; set; }
    }

    public class DeveloperSettings
    {
        public string machineName { get; set; }
        public bool executeDist { get; set; }
        public bool executeTest { get; set; }
        public string serveApp { get; set; }
        public string releaseApp { get; set; }
        public List<AngularProject> angularProjects { get; set; }
    }

    public class VisualProject
    {
        public string name { get; set; }
        public DeveloperSettings developerSettings { get; set; }
        public bool showPanel { get; set; }
        public bool showVersion { get; set; }
    }

    public class BuildConfiguration
    {
        public string machineName { get; set; }
        public List<VisualProject> visualProjects { get; set; }
        public List<string> shared { get; set; }
    }

    public class EventProperties
    {
        public string exception { get; set; }
        public string message { get; set; }
        public int entryType { get; set; }
    }

    public class Simpson
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
     public class Keys
    {
        public string GoogleMapKey { get; set; }
        public string SmsFrom { get; set; }
        public string SmsPw { get; set; }
        public string aspNetCoreVersion { get; set; }
    } 
     public class Creds
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }   
    public class BookInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Summary { get; set; }
    }

    public class ActionsFile
    {
        public string FileName { get; set; }
        public string ActionsQueue { get; set; }
    }

    public class Action
    {
        public string name { get; set; }
        public string title { get; set; }
        public double delay { get; set; }
        public object payload { get; set; }
        public bool playback { get; set; }
    }

    public class TextMessage
    {
        public string Message { get; set; }
        public string CellCarrierName { get; set; }
        public long MobileNumber { get; set; }
    }
}
