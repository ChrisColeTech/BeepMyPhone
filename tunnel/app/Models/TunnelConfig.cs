namespace BeepMyPhone.Tunneling.Models;

/// <summary>
/// Configuration parameters for FRP tunnel creation
/// Contains all necessary settings for establishing a tunnel to BeepMyPhone backend
/// </summary>
public class TunnelConfig
{
    /// <summary>
    /// Local IP address to tunnel (typically 127.0.0.1)
    /// </summary>
    public string LocalIp { get; set; } = "127.0.0.1";

    /// <summary>
    /// Local port to tunnel (BeepMyPhone backend port, typically 5000)
    /// </summary>
    public int LocalPort { get; set; } = 5000;

    /// <summary>
    /// FRP server address (public relay server)
    /// </summary>
    public string ServerAddr { get; set; } = "frp.beepphone.dev";

    /// <summary>
    /// FRP server port (typically 7000)
    /// </summary>
    public int ServerPort { get; set; } = 7000;

    /// <summary>
    /// Authentication token for FRP server
    /// </summary>
    public string? Token { get; set; }

    /// <summary>
    /// Unique proxy name for this tunnel
    /// </summary>
    public string ProxyName { get; set; } = "beepphone-http";

    /// <summary>
    /// Custom subdomain for the tunnel (optional)
    /// </summary>
    public string? SubDomain { get; set; }

    /// <summary>
    /// Custom domain for the tunnel (optional)
    /// </summary>
    public string? CustomDomain { get; set; }

    /// <summary>
    /// Whether to enable TLS for the connection
    /// </summary>
    public bool EnableTls { get; set; } = true;

    /// <summary>
    /// Whether to enable compression
    /// </summary>
    public bool UseCompression { get; set; } = true;

    /// <summary>
    /// Whether to enable encryption
    /// </summary>
    public bool UseEncryption { get; set; } = true;

    /// <summary>
    /// User identifier for the FRP server
    /// </summary>
    public string? User { get; set; }

    /// <summary>
    /// Log level for FRP client (info, debug, warn, error)
    /// </summary>
    public string LogLevel { get; set; } = "info";

    /// <summary>
    /// Protocol to use (tcp, kcp, quic, websocket, wss)
    /// </summary>
    public string Protocol { get; set; } = "tcp";

    /// <summary>
    /// Validates the tunnel configuration
    /// </summary>
    /// <returns>True if configuration is valid</returns>
    public bool IsValid()
    {
        return !string.IsNullOrEmpty(LocalIp) &&
               LocalPort > 0 && LocalPort <= 65535 &&
               !string.IsNullOrEmpty(ServerAddr) &&
               ServerPort > 0 && ServerPort <= 65535 &&
               !string.IsNullOrEmpty(ProxyName);
    }

    /// <summary>
    /// Creates a default configuration for BeepMyPhone tunneling
    /// </summary>
    /// <param name="localPort">Local port where BeepMyPhone backend is running</param>
    /// <returns>Default tunnel configuration</returns>
    public static TunnelConfig CreateDefault(int localPort = 5000)
    {
        return new TunnelConfig
        {
            LocalPort = localPort,
            ProxyName = $"beepphone-{Guid.NewGuid().ToString("N")[..8]}",
            SubDomain = Guid.NewGuid().ToString("N")[..12]
        };
    }
}