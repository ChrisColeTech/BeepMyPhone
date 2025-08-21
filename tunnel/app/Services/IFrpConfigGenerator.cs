using BeepMyPhone.Tunneling.Models;

namespace BeepMyPhone.Tunneling.Services;

/// <summary>
/// Interface for generating FRP configuration files and command-line arguments
/// Follows Single Responsibility Principle by focusing only on configuration generation
/// </summary>
public interface IFrpConfigGenerator
{
    /// <summary>
    /// Generates FRP command-line arguments from tunnel configuration
    /// </summary>
    /// <param name="config">Tunnel configuration parameters</param>
    /// <returns>Command-line arguments string for FRP client</returns>
    string GenerateCommandLineArgs(TunnelConfig config);

    /// <summary>
    /// Generates FRP configuration file content in INI format
    /// </summary>
    /// <param name="config">Tunnel configuration parameters</param>
    /// <returns>INI configuration file content</returns>
    string GenerateConfigFile(TunnelConfig config);

    /// <summary>
    /// Validates that the configuration is complete and valid for FRP
    /// </summary>
    /// <param name="config">Tunnel configuration to validate</param>
    /// <returns>True if configuration is valid for FRP usage</returns>
    bool ValidateConfig(TunnelConfig config);

    /// <summary>
    /// Creates a default tunnel configuration for BeepMyPhone
    /// </summary>
    /// <param name="localPort">Local port where BeepMyPhone backend is running</param>
    /// <param name="serverAddr">FRP server address</param>
    /// <returns>Default tunnel configuration</returns>
    TunnelConfig CreateDefaultConfig(int localPort = 5000, string serverAddr = "frp.beepphone.dev");

    /// <summary>
    /// Escapes command-line arguments to prevent injection attacks
    /// </summary>
    /// <param name="argument">Argument to escape</param>
    /// <returns>Safely escaped argument</returns>
    string EscapeArgument(string argument);
}