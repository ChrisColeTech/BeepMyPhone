using WindowsNotificationService.Services;
using WindowsNotificationService.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Configure services for Windows Service hosting
builder.Services.AddWindowsService();

// Add notification monitoring service
builder.Services.AddSingleton<NotificationMonitorService>();
builder.Services.AddSingleton<INotificationMonitorService>(provider => provider.GetRequiredService<NotificationMonitorService>());
builder.Services.AddHostedService<NotificationMonitorService>(provider => provider.GetRequiredService<NotificationMonitorService>());

// Add notification broadcast service
builder.Services.AddSingleton<NotificationBroadcastService>();
builder.Services.AddHostedService<NotificationBroadcastService>(provider => provider.GetRequiredService<NotificationBroadcastService>());

// Add notification formatter service
builder.Services.AddSingleton<NotificationFormatterService>();

// Add device management service
builder.Services.AddSingleton<DeviceManagementService>();

// Add API controllers
builder.Services.AddControllers();

// Add API Explorer and Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Windows Notification Service API",
        Version = "v1",
        Description = "API for monitoring and retrieving Windows notifications in real-time",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "BeepMyPhone",
            Email = "contact@beepmyphone.com"
        }
    });
    
    // Include XML documentation if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Add SignalR for real-time notifications
builder.Services.AddSignalR();

// Add CORS for frontend communication
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure URLs to listen on all interfaces for Windows access
app.Urls.Add("http://0.0.0.0:5001");

// Configure middleware
app.UseCors("AllowFrontend");

// Enable Swagger in development and production
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Windows Notification Service API v1");
    options.RoutePrefix = "swagger"; // Swagger UI will be available at /swagger
    options.DocumentTitle = "Windows Notification Service API";
});

app.UseRouting();

// Map API endpoints
app.MapControllers();

// Map SignalR hub
app.MapHub<NotificationHub>("/notificationHub");

// Health check endpoint
app.MapGet("/health", () => "Windows Notification Service is running");

app.Run();