using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using AngularNetCore.Hubs;
using Microsoft.Net.Http.Headers;

namespace AngularNetCore
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddCors(options =>
            {
                options.AddPolicy("SignalR", x =>
                {
                    // devServer
                    x.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
                    // prodServer
                    x.WithOrigins("http://localhost:7779").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
                });
            });
            services.AddSignalR();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();
            app.UseCors("SignalR");
            app.UseDefaultFiles();

            // app.UseStaticFiles();
            app.UseStaticFiles(new StaticFileOptions
            {   // cache static files for 1 minute
                OnPrepareResponse = ctx =>
                {
                    const int durationInSeconds = 60;
                    ctx.Context.Response.Headers[HeaderNames.CacheControl] =
                        "public,max-age=" + durationInSeconds;
                }
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<MessageHub>("/messageHub");
            });

            // This fixes issue in release with refresh page
            app.Use(async (context, next) =>
            {
                if (context.Request.Path.Value == "/")
                {
                    await next().ConfigureAwait(false);
                }
                else
                {
                    context.Response.Redirect("/", false);
                }
            });


        }
    }
}
