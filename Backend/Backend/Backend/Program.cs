using Backend.Attributes;
using BackendInterface;
using Microsoft.OpenApi.Models;
using MysqlDatabase;

MysqlDatabaseManager.DestroyDatabase();
MysqlDatabaseManager.InitializeDatabase();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<IDatabaseServiceProvider, MysqlDatabaseManager>();

builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
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

builder.Services.AddCors(cors =>
{
    cors.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthorization();
app.UseCors(x => x
    .AllowAnyMethod()
    .AllowAnyHeader()
    .SetIsOriginAllowed(origin => true)
    .AllowCredentials());
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.Run();
