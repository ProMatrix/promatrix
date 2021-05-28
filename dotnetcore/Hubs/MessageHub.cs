using System;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Angular.Net.CLI.Models;
using System.Linq;
using System.Collections.Generic;
using System.Threading;

namespace AngularNetCore.Hubs
{
    public class MessageHub : Hub
    {
        static List<ChannelRegistration> _registeredChannels = new List<ChannelRegistration>();
        private long getTimeInMilliseconds()
        {
            return DateTime.Now.Ticks / 10000; ;
        }

        private async void RemoveStaleRegistrations()
        {
            // remove any stale channel after 5 seconds
            const long msTimeAllowed = 5000;
            var staleChannels = _registeredChannels.FindAll(x => (getTimeInMilliseconds() - x.LastAck) > msTimeAllowed);
            if (staleChannels.Count > 0)
            {
                foreach (ChannelRegistration channel in staleChannels.ToList())
                {
                    _registeredChannels.Remove(channel);
                }
                await Clients.All.SendAsync("ReturnRegisteredChannels", _registeredChannels);
            }
        }

        public async Task RefreshRegisteredChannel(ChannelRegistration registeredChannel)
        {
            // update the register to validate still available
            try
            {
                var channel = _registeredChannels.FirstOrDefault(i => i.Id == registeredChannel.Id);
                if (channel != null) // this channel already exists so just update the subscriptions
                    channel.Subscriptions = registeredChannel.Subscriptions;

                if (registeredChannel.Message.Length > 0)
                {
                    registeredChannel.MessageTime = getTimeInMilliseconds();
                    await Clients.All.SendAsync("ReturnChannelMessage", registeredChannel);
                }
                else
                    RemoveStaleRegistrations();

                if (channel != null)
                    channel.LastAck = getTimeInMilliseconds();
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        public async Task ChannelRegistration(ChannelRegistration unregisteredChannel)
        {
            // add this channel to the register
            try
            {
                if (_registeredChannels.Exists(i => i.Name == unregisteredChannel.Name))
                    throw new Exception("The channel name is already registered!");
                var channel = _registeredChannels.FirstOrDefault(i => i.Id == unregisteredChannel.Id);

                if (channel != null)
                {// this channel already exists so just update the subscriptions
                    channel.LastAck = getTimeInMilliseconds();
                    channel.Subscriptions = unregisteredChannel.Subscriptions;
                }
                else
                {
                    unregisteredChannel.Id = getTimeInMilliseconds().ToString(); // registration time
                    unregisteredChannel.LastAck = getTimeInMilliseconds();
                    _registeredChannels.Add(unregisteredChannel);
                    await Clients.All.SendAsync("ReturnRegisteredChannels", _registeredChannels);
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        public async Task ChannelUnRegistration(ChannelRegistration registeredChannel)
        {
            // remove this channel from the register
            try
            {
                var channel = _registeredChannels.FirstOrDefault(i => i.Name == registeredChannel.Name);
                if (channel != null) // this channel already exists so just update the subscriptions
                    _registeredChannels.Remove(channel);
                await Clients.All.SendAsync("ReturnChannelUnRegistration", _registeredChannels);
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        // Get All registered channels on app startup
        public async Task GetRegisteredChannels()
        {
            // fetch all the registered channels
            try
            {
                await Clients.All.SendAsync("ReturnRegisteredChannels", _registeredChannels);
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }
    }
}