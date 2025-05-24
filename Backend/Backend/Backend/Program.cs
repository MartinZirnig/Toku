using Backend.Attributes;
using Backend.Controllers.WebSockets.Management;
using BackendInterface;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.WebSockets;
using Microsoft.OpenApi.Models;
using MysqlDatabase;

var builder = WebApplication.CreateBuilder(args);

MysqlDatabaseManager.InitializeDatabase();

builder.Services.AddControllers();
builder.Services.AddSingleton<IDatabaseServiceProvider, MysqlDatabaseManager>();

builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
});
builder.Services.AddWebSockets(option =>
{
    option.KeepAliveInterval = TimeSpan.FromSeconds(120);
    option.KeepAliveTimeout = TimeSpan.FromSeconds(120);
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition(AuthorizationAttribute.UserIdentificationKey, new OpenApiSecurityScheme
    {
        Description = "Zadej svůj vlastní Client ID",
        Name = AuthorizationAttribute.UserIdentificationKey,
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = AuthorizationAttribute.UserIdentificationKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = AuthorizationAttribute.UserIdentificationKey
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddOpenApi();

var app = builder.Build();
app.UseWebSockets();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
        c.RoutePrefix = string.Empty;
    });

    app.MapOpenApi();
}




app.UseCors();

app.UseAuthentication();
app.UseAuthorization();
#if DEBUG
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

    logger.LogInformation("Incoming request: {method} {url}", context.Request.Method, context.Request.Path);

    await next();

    logger.LogInformation("Response status code: {statusCode}", context.Response.StatusCode);

    if (context.Response.StatusCode >= 400)
    {
        logger.LogWarning("Request was rejected or failed with status {statusCode}", context.Response.StatusCode);
        
    }
});
#endif

app.Use(SocketController.ServiceSocketRequest);

app.MapControllers();

await app.RunAsync();