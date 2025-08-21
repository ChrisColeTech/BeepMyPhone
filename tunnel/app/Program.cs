using BeepMyPhone.Tunneling.Services;

namespace BeepMyPhone.Tunneling;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container
        builder.Services.AddControllers();

        // Register tunnel services
        builder.Services.AddSingleton<IBinaryValidator, BinaryValidator>();
        builder.Services.AddSingleton<IBinaryManager, BinaryManager>();
        builder.Services.AddSingleton<IFrpConfigGenerator, FrpConfigGenerator>();
        builder.Services.AddSingleton<ITunnelProcessManager, TunnelProcessManager>();

        var app = builder.Build();

        // Configure the HTTP request pipeline
        app.UseHttpsRedirection();
        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }
}