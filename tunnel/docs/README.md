# BeepMyPhone Tunneling Component

## Project Overview

The BeepMyPhone Tunneling Component eliminates the need for users to manually configure external tunneling services (ngrok, LocalTunnel, Cloudflare) by embedding tunneling capabilities directly into the BeepMyPhone backend. This component automatically creates secure public URLs that enable cross-network connectivity between the Windows PC and mobile devices without requiring users to understand or configure complex networking setups.

### Component Purpose and Role

The tunneling component serves as the automatic networking bridge in the BeepMyPhone ecosystem, transforming the application from a local-network-only solution to a globally accessible notification forwarding system. It operates as a background service that:

- Automatically establishes secure tunnels to public relay servers
- Generates user-friendly public URLs for mobile device connection
- Manages tunnel lifecycle including connection, health monitoring, and recovery
- Provides seamless integration with existing BeepMyPhone SignalR infrastructure
- Eliminates all manual networking configuration for end users

### Technology Stack with Detailed Justification

**Primary Technology: FRP (Fast Reverse Proxy) v0.54.0**

FRP was selected as the core tunneling technology after comprehensive evaluation of alternatives including Microsoft YARP, custom WebSocket solutions, and other reverse proxy tools. The selection criteria prioritized:

- **Mature Tunneling Focus**: FRP is purpose-built for reverse proxy tunneling, unlike general-purpose reverse proxies
- **Production Battle-Testing**: Used by thousands of developers worldwide with proven reliability
- **Protocol Support**: Native support for HTTP, HTTPS, TCP, UDP, and WebSocket protocols
- **Automatic Reconnection**: Built-in connection recovery and health monitoring
- **Configuration Simplicity**: Minimal configuration requirements for basic tunneling
- **Cross-Platform Binary**: Single binary deployment across Windows, Linux, and macOS
- **No Runtime Dependencies**: Standalone executable with no external dependencies

**Supporting Technologies:**

- **.NET 8.0 Process Management**: For embedding and managing FRP client process
- **System.Text.Json**: For FRP configuration file generation and tunnel response parsing
- **System.Diagnostics.Process**: For FRP binary lifecycle management
- **HttpClient**: For tunnel registration and health check API calls
- **BackgroundService**: For automatic tunnel startup and monitoring
- **QRCode.NET**: For generating connection QR codes for mobile devices

### Integration Points with Other Components

**Backend Integration:**
- Registers as hosted service in Program.cs dependency injection container
- Exposes tunnel URL through TunnelManager singleton for UI consumption
- Integrates with existing SignalR infrastructure without modification
- Provides health check endpoint for tunnel status monitoring

**Frontend Integration:**
- Displays tunnel status and public URL in connection dashboard
- Shows QR code for easy mobile device scanning and setup
- Provides manual tunnel restart functionality through API endpoints
- Integrates tunnel status into existing device connection monitoring

**Mobile Integration:**
- iOS app automatically detects tunnel URLs through smart protocol detection
- QR code scanning for instant tunnel URL configuration
- Automatic HTTPS/WSS protocol selection for tunnel connections
- Background connection monitoring with automatic reconnection

## Complete Feature Specification

### Core Features

**Automatic Tunnel Establishment**
- Embedded FRP client automatically connects to relay servers on backend startup
- Dynamic public URL generation using device-specific identifiers
- SSL/TLS certificate automatic provisioning through relay server infrastructure
- Connection persistence with automatic reconnection on network interruptions
- Health monitoring with configurable heartbeat intervals

**Device-Specific URL Generation**
- Unique subdomain generation based on device hardware fingerprint
- Memorable URL patterns: `{device-id}.tunnel.beepphone.dev`
- Automatic DNS propagation through relay server infrastructure
- URL consistency across application restarts and network changes
- Custom subdomain support for advanced users

**QR Code Generation and Display**
- Automatic QR code generation containing complete connection information
- QR code display in frontend dashboard for easy mobile scanning
- QR code format includes tunnel URL, device name, and connection parameters
- Support for both SVG and PNG QR code formats
- QR code regeneration on tunnel URL changes

**Tunnel Health Monitoring**
- Continuous connection health checks with configurable intervals
- Automatic tunnel recovery on connection failures
- Connection status reporting through BeepMyPhone health check endpoints
- Performance metrics collection including latency and throughput
- Alert generation for persistent tunnel failures

**Multi-Region Relay Support**
- Primary relay server selection based on geographic proximity
- Automatic failover to secondary relay servers on primary failure
- Load balancing across available relay servers
- Region-specific tunnel URLs for optimal performance
- Custom relay server configuration for enterprise deployments

### Advanced Features

**Tunnel Configuration Management**
- JSON-based configuration with hot-reload capabilities
- Custom tunnel parameters including timeout and retry settings
- Advanced FRP configuration options exposure through structured configuration
- Environment-specific configuration profiles (development, staging, production)
- Configuration validation with detailed error reporting

**Security and Authentication**
- Device-specific authentication tokens for tunnel access control
- End-to-end encryption for all tunnel traffic
- Rate limiting and abuse prevention at relay server level
- IP whitelisting support for restricted environments
- Tunnel access logging and audit trail capabilities

**Performance Optimization**
- Connection pooling and reuse for improved efficiency
- Traffic compression for reduced bandwidth usage
- Protocol optimization based on traffic type (HTTP vs WebSocket)
- Adaptive quality settings based on connection performance
- Bandwidth monitoring and throttling capabilities

**Enterprise Integration Features**
- Corporate proxy support for restricted network environments
- Active Directory integration for user authentication
- Group policy support for centralized tunnel configuration
- LDAP integration for enterprise user management
- Compliance reporting and audit log generation

**Developer and Debugging Features**
- Comprehensive tunnel event logging with configurable verbosity levels
- Real-time tunnel traffic inspection and debugging tools
- Performance profiling and bottleneck identification
- Network diagnostics and connectivity testing utilities
- API endpoints for programmatic tunnel management

### Feature Dependencies and Relationships

**Core Dependency Chain:**
1. FRP binary availability → Tunnel establishment
2. Relay server connectivity → Public URL generation
3. DNS propagation → Mobile device connectivity
4. Health monitoring → Connection reliability
5. QR code generation → User experience optimization

**Feature Interaction Matrix:**
- Tunnel establishment enables all downstream features
- Health monitoring depends on established tunnel connection
- QR code generation requires active tunnel with valid public URL
- Multi-region support enhances but doesn't block basic functionality
- Security features operate transparently without affecting core functionality

## Functional Requirements

### Performance Targets with Specific Metrics

**Tunnel Establishment Performance:**
- Initial tunnel connection: Maximum 3 seconds from service startup
- Public URL availability: Maximum 5 seconds after tunnel establishment
- QR code generation: Maximum 500 milliseconds after URL availability
- Configuration reload: Maximum 1 second for configuration changes
- Failover switching: Maximum 10 seconds between primary and secondary relay

**Runtime Performance Metrics:**
- Notification delivery latency overhead: Maximum 100 milliseconds additional latency
- Tunnel heartbeat frequency: 30-second intervals with 5-second timeout
- Connection recovery time: Maximum 15 seconds after network interruption
- Memory usage: Maximum 50MB additional overhead for tunnel service
- CPU usage: Maximum 2% CPU utilization during normal operation

**Scalability and Throughput:**
- Concurrent notification support: 1000+ notifications per minute
- Mobile device connections: Support for 10+ simultaneous mobile devices
- Tunnel bandwidth: Support for 10Mbps sustained throughput
- Configuration changes: Hot-reload without service interruption
- Log rotation: Automatic log management with configurable retention periods

### Reliability Requirements

**Connection Reliability Standards:**
- Tunnel uptime target: 99.5% availability excluding planned maintenance
- Maximum consecutive connection failures: 3 failures before alerting
- Recovery success rate: 95% automatic recovery from network interruptions
- Health check success rate: 98% health check success rate
- Failover reliability: 99% successful failover to backup relay servers

**Error Handling and Recovery:**
- Graceful degradation: Automatic fallback to local-only mode on tunnel failures
- Error categorization: Detailed error classification for troubleshooting
- Retry mechanisms: Exponential backoff with maximum retry limits
- State preservation: Tunnel configuration persistence across restarts
- User notification: Clear error messaging for tunnel status in UI

**Data Integrity and Consistency:**
- Configuration consistency: Atomic configuration updates with rollback capability
- Tunnel state synchronization: Consistent tunnel status across all UI components
- Error logging: Comprehensive error logging with correlation IDs
- Monitoring integration: Integration with external monitoring systems
- Backup procedures: Automatic configuration backup and restore capabilities

### Security Requirements

**Encryption and Data Protection:**
- Transport encryption: TLS 1.3 minimum for all tunnel communications
- Certificate validation: Strict certificate validation with pinning support
- Token-based authentication: JWT tokens for tunnel access with 24-hour expiration
- Data in transit: AES-256 encryption for all notification payload data
- No data retention: Zero persistent storage of notification content at relay servers

**Access Control and Authentication:**
- Device authentication: Unique device certificates for tunnel access
- Rate limiting: 1000 requests per minute per device maximum
- IP restrictions: Optional IP whitelisting for enhanced security
- Audit logging: Comprehensive access logging with tamper protection
- Session management: Secure session handling with automatic timeout

**Compliance and Privacy:**
- GDPR compliance: No personal data retention at relay infrastructure
- Data sovereignty: Regional relay servers for data locality requirements
- Privacy by design: Minimal data collection with user consent
- Security auditing: Regular security assessments and penetration testing
- Incident response: Defined procedures for security incident handling

### User Experience Requirements

**Setup and Configuration Simplicity:**
- Zero-configuration startup: Automatic tunnel creation without user intervention
- One-click connection: QR code scanning for instant mobile device setup
- Visual status indicators: Clear tunnel status display in UI with color coding
- Error messaging: Plain-language error messages with resolution guidance
- Progress indication: Real-time progress updates during tunnel establishment

**Performance and Responsiveness:**
- UI responsiveness: Sub-second response times for all tunnel-related UI interactions
- Status updates: Real-time tunnel status updates without page refresh
- Background operation: Silent operation without user interruption
- Resource efficiency: Minimal impact on system performance and battery life
- Network adaptation: Automatic adaptation to varying network conditions

## Non-Functional Requirements

### Performance Requirements (Latency, Throughput, Memory)

**Latency Requirements:**
- End-to-end notification delivery: Maximum 200ms additional latency vs direct connection
- Tunnel establishment latency: Maximum 3 seconds cold start, 1 second warm restart
- Health check response time: Maximum 1 second for tunnel health verification
- Configuration reload latency: Maximum 500ms for configuration changes
- UI status update latency: Maximum 100ms for tunnel status changes in user interface

**Throughput Requirements:**
- Peak notification throughput: 100 notifications per second sustained
- Concurrent connection support: 50 simultaneous mobile device connections
- Bandwidth efficiency: Maximum 10% overhead for tunnel protocol encapsulation
- Data compression: 70% compression ratio for notification payload data
- Batch processing: Support for batch notification delivery with 50ms maximum delay

**Memory Usage Requirements:**
- Base memory footprint: Maximum 30MB for tunnel service in idle state
- Peak memory usage: Maximum 100MB during high-traffic periods
- Memory leak prevention: Zero memory growth over 24-hour operation periods
- FRP process overhead: Maximum 20MB additional for embedded FRP client
- Configuration caching: Efficient configuration caching with 5MB maximum cache size

**CPU and Resource Utilization:**
- Normal operation CPU usage: Maximum 1% CPU utilization average
- Peak operation CPU usage: Maximum 5% CPU utilization during tunnel establishment
- Background processing: All tunnel operations in background threads without UI blocking
- Resource cleanup: Automatic resource cleanup on service shutdown
- Thread management: Maximum 5 dedicated threads for tunnel operations

### Reliability Requirements (Uptime, Fault Tolerance)

**Availability and Uptime Targets:**
- Service availability: 99.5% uptime excluding planned maintenance windows
- Tunnel connection availability: 99% tunnel connection success rate
- Recovery time objective (RTO): Maximum 30 seconds for service recovery
- Recovery point objective (RPO): Zero data loss during tunnel failures
- Planned maintenance windows: Maximum 2 hours monthly maintenance downtime

**Fault Tolerance and Recovery:**
- Network interruption tolerance: Automatic reconnection within 15 seconds
- Relay server failover: Sub-10 second failover to backup relay servers
- Configuration corruption recovery: Automatic configuration restoration from backup
- Process failure recovery: Automatic FRP process restart on unexpected termination
- Cascading failure prevention: Circuit breaker patterns for external service dependencies

**Monitoring and Alerting:**
- Health check frequency: 30-second interval health monitoring
- Alert generation: Immediate alerts for tunnel failures exceeding 60 seconds
- Performance monitoring: Continuous monitoring of latency and throughput metrics
- Log aggregation: Centralized logging with structured log format
- Metric retention: 30-day metric retention for trend analysis

### Security Requirements (Encryption, Authentication)

**Encryption Requirements:**
- Transport layer security: TLS 1.3 mandatory for all tunnel communications
- Cipher suite restrictions: AES-256-GCM and ChaCha20-Poly1305 cipher suites only
- Certificate management: Automatic certificate rotation with 90-day maximum validity
- Key management: Hardware security module (HSM) support for key storage
- Perfect forward secrecy: Ephemeral key exchange for all tunnel sessions

**Authentication and Authorization:**
- Device authentication: X.509 certificate-based device authentication
- Token management: JWT tokens with 24-hour expiration and automatic refresh
- Multi-factor authentication: Optional TOTP support for enhanced security
- Role-based access control: Granular permissions for tunnel management operations
- Session security: Secure session management with automatic timeout after 8 hours

**Security Monitoring and Compliance:**
- Intrusion detection: Real-time monitoring for suspicious tunnel activity
- Security event logging: Comprehensive security event logging with SIEM integration
- Vulnerability management: Regular security assessments and patch management
- Compliance frameworks: SOC 2 Type II and ISO 27001 compliance readiness
- Data protection: GDPR and CCPA compliance for personal data handling

### Compatibility Requirements (Platforms, Versions)

**Operating System Compatibility:**
- Windows support: Windows 10 (1903) and later, Windows 11 all versions
- Windows Server support: Windows Server 2019 and later
- Architecture support: x64 and ARM64 processor architectures
- .NET runtime: .NET 8.0 runtime requirement with automatic installation
- Windows features: Windows Subsystem for Linux (WSL) compatibility

**Network Environment Compatibility:**
- NAT traversal: Support for all common NAT configurations including symmetric NAT
- Firewall compatibility: Operation through corporate firewalls with minimal configuration
- Proxy support: HTTP and SOCKS proxy support for corporate environments
- IPv6 support: Dual-stack IPv4/IPv6 support with automatic fallback
- Port requirements: Configurable outbound port usage with default port 7000

**Integration Compatibility:**
- Antivirus compatibility: Verified compatibility with major antivirus solutions
- VPN compatibility: Operation through VPN connections without interference
- Container support: Docker container deployment capability
- Virtualization: Support for VMware, Hyper-V, and VirtualBox environments
- Cloud platforms: Deployment support for Azure, AWS, and Google Cloud Platform

## Technology Stack Justification

### Primary Technology Choices with Reasoning

**FRP (Fast Reverse Proxy) v0.54.0 Selection Justification:**

FRP was selected over alternative tunneling solutions after comprehensive evaluation of Microsoft YARP, custom WebSocket implementations, Cloudflare Tunnel, and other reverse proxy solutions. The decision criteria included:

**Technical Superiority:**
- Purpose-built for tunneling workloads with optimized connection handling
- Native support for HTTP, HTTPS, TCP, UDP, and WebSocket protocols
- Built-in health monitoring, automatic reconnection, and failover capabilities
- Zero-dependency single binary deployment simplifying distribution and updates
- Mature codebase with 5+ years of production use and active maintenance

**Integration Benefits:**
- Simple configuration file-based setup requiring minimal integration complexity
- Process-based architecture allowing clean separation from main application
- Comprehensive logging and monitoring capabilities for troubleshooting
- Cross-platform binary availability for future deployment flexibility
- Well-documented API and configuration options for customization

**Performance Characteristics:**
- Low latency overhead (typically <50ms additional latency)
- High throughput capacity (tested to 10,000+ concurrent connections)
- Efficient resource utilization with minimal memory and CPU overhead
- Built-in traffic compression reducing bandwidth requirements
- Connection pooling and reuse optimizations

**.NET 8.0 Process Management Framework Selection:**

.NET 8.0 was chosen for tunnel service implementation based on:

**Ecosystem Integration:**
- Native integration with existing BeepMyPhone .NET backend architecture
- Comprehensive process management APIs through System.Diagnostics.Process
- Built-in dependency injection and hosted service patterns
- Mature logging and configuration frameworks for operational management
- Strong typing and compile-time error detection reducing runtime failures

**Operational Benefits:**
- BackgroundService base class providing lifecycle management patterns
- IConfiguration integration for flexible configuration management
- ILogger integration for structured logging and monitoring
- HttpClient integration for relay server communication
- Built-in health check frameworks for operational monitoring

### Alternative Technologies Considered and Why Rejected

**Microsoft YARP (Yet Another Reverse Proxy) - Rejected:**

While YARP is Microsoft's official reverse proxy library, it was rejected for this use case because:
- Designed primarily for load balancing and API gateway scenarios, not tunneling
- Requires complex configuration for simple reverse proxy tunneling
- Lacks built-in tunnel management features like automatic reconnection
- Higher implementation complexity compared to FRP's file-based configuration
- No built-in support for dynamic tunnel URL generation

**Custom WebSocket Tunnel Implementation - Rejected:**

A custom WebSocket-based tunneling solution was considered but rejected due to:
- Significant development complexity requiring custom protocol implementation
- Need to reinvent connection management, health monitoring, and recovery mechanisms
- Extensive testing requirements for edge cases already solved by mature solutions
- Maintenance burden for custom networking code
- Risk of introducing security vulnerabilities in custom protocol implementation

**Cloudflare Tunnel - Rejected:**

Cloudflare Tunnel was rejected despite its technical capabilities because:
- Requires external account registration creating user friction
- Dependency on Cloudflare infrastructure creating single point of failure
- Potential cost implications for high-traffic usage patterns
- Less control over tunnel infrastructure and configuration
- Complex authentication setup requiring API key management

**ngrok - Rejected:**

ngrok was rejected as the embedded solution because:
- Requires paid subscription for persistent URLs and custom domains
- Credit card requirement creating barrier for many users
- Session limits and connection restrictions on free tier
- Dependency on external service with potential service availability risks
- Limited customization options for enterprise deployment scenarios

### Dependency Analysis and Risk Assessment

**Primary Dependencies Risk Analysis:**

**FRP Binary Dependency (High Impact, Low Risk):**
- Risk: FRP project abandonment or security vulnerabilities
- Mitigation: Open source with active community, fork capability, version pinning
- Impact: Service disruption if binary becomes unavailable
- Probability: Low (active project with strong community support)

**.NET 8.0 Runtime Dependency (Medium Impact, Very Low Risk):**
- Risk: .NET runtime compatibility issues or security vulnerabilities
- Mitigation: Microsoft LTS support through 2026, automatic update mechanisms
- Impact: Requires runtime updates for security patches
- Probability: Very Low (Microsoft official support with long-term commitment)

**Network Connectivity Dependency (High Impact, Medium Risk):**
- Risk: Internet connectivity interruption blocking tunnel establishment
- Mitigation: Graceful degradation to local-only mode, multiple relay servers
- Impact: Loss of cross-network functionality during outages
- Probability: Medium (depends on user network reliability)

**Relay Server Infrastructure Dependency (High Impact, Medium Risk):**
- Risk: Relay server unavailability or performance degradation
- Mitigation: Multi-region deployment, automatic failover, local fallback
- Impact: Cross-network functionality unavailable during relay outages
- Probability: Medium (mitigated by redundant infrastructure)

**Secondary Dependencies Risk Analysis:**

**QRCode.NET Library (Low Impact, Very Low Risk):**
- Risk: Library maintenance discontinuation or compatibility issues
- Mitigation: Simple library with stable API, alternative libraries available
- Impact: QR code generation functionality only
- Probability: Very Low (stable library with minimal dependencies)

**System.Text.Json (Very Low Risk):**
- Risk: JSON serialization compatibility issues
- Mitigation: Microsoft official library with backward compatibility commitment
- Impact: Configuration and API communication only
- Probability: Very Low (core .NET library with strong compatibility guarantees)

## Integration Requirements

### API Integration Specifications

**Tunnel Management API Endpoints:**

**GET /api/tunnel/status**
- Purpose: Retrieve current tunnel status and configuration information
- Response format: JSON with tunnel URL, connection status, health metrics
- Authentication: Internal API, no authentication required
- Response time: Maximum 100ms
- Error handling: Returns 503 Service Unavailable if tunnel service not initialized

**POST /api/tunnel/restart**
- Purpose: Manually restart tunnel connection
- Request format: Empty POST body
- Response format: JSON with operation status and estimated completion time
- Authentication: Internal API, no authentication required
- Processing time: Maximum 5 seconds for tunnel reestablishment
- Error handling: Returns 500 Internal Server Error with detailed error message

**GET /api/tunnel/qrcode**
- Purpose: Generate QR code image for mobile device setup
- Response format: PNG image binary data
- Query parameters: size (optional, default 200px), format (png/svg)
- Caching: 5-minute cache with ETag support
- Error handling: Returns 404 Not Found if no active tunnel

**GET /api/tunnel/metrics**
- Purpose: Retrieve tunnel performance and health metrics
- Response format: JSON with latency, throughput, connection statistics
- Update frequency: Real-time metrics updated every 30 seconds
- Historical data: 24-hour metric history with 1-minute granularity
- Error handling: Returns partial data with warnings for incomplete metrics

### Communication Protocols

**FRP Client Communication Protocol:**
- Transport: TCP with TLS 1.3 encryption
- Port: Configurable outbound (default 7000)
- Protocol: FRP custom binary protocol over TCP
- Heartbeat: 30-second interval with 5-second timeout
- Reconnection: Exponential backoff starting at 1 second, maximum 60 seconds

**Relay Server Communication Protocol:**
- Registration: HTTPS POST to relay server registration endpoint
- Authentication: Bearer token authentication with JWT format
- Health checks: HTTP GET to health endpoint every 30 seconds
- Error reporting: Structured JSON error responses with correlation IDs
- Rate limiting: 1000 requests per minute per device with 429 Too Many Requests response

**Internal Service Communication:**
- Tunnel status updates: Event-driven notifications through .NET EventSource
- Configuration changes: File system watcher with debounced reload (500ms delay)
- Health monitoring: Background timer with 10-second interval health checks
- Error propagation: Structured logging with correlation IDs for request tracing
- Metrics collection: In-memory metrics with periodic aggregation and export

### Data Exchange Formats

**Tunnel Configuration Format (JSON):**
```json
{
  "enabled": true,
  "relayServers": ["tunnel1.beepphone.dev", "tunnel2.beepphone.dev"],
  "deviceId": "auto-generated",
  "customSubdomain": null,
  "heartbeatInterval": 30,
  "reconnectDelay": 5,
  "maxReconnectAttempts": 10,
  "encryption": {
    "enabled": true,
    "algorithm": "AES-256-GCM"
  }
}
```

**Tunnel Status Response Format (JSON):**
```json
{
  "isActive": true,
  "publicUrl": "https://abc123.tunnel.beepphone.dev",
  "connectionStatus": "connected",
  "lastConnected": "2025-01-15T10:30:00Z",
  "relayServer": "tunnel1.beepphone.dev",
  "metrics": {
    "latency": 45,
    "throughput": 1024,
    "errorRate": 0.001
  }
}
```

**Error Response Format (JSON):**
```json
{
  "error": {
    "code": "TUNNEL_CONNECTION_FAILED",
    "message": "Unable to establish tunnel connection",
    "details": "Connection timeout after 30 seconds",
    "correlationId": "uuid-v4",
    "timestamp": "2025-01-15T10:30:00Z",
    "retryAfter": 60
  }
}
```

### Error Handling Strategies

**Connection Error Handling:**
- Network timeout errors: Automatic retry with exponential backoff (1s, 2s, 4s, 8s, 16s, 30s max)
- Authentication failures: Immediate error reporting with token refresh attempt
- Relay server unavailable: Automatic failover to secondary servers within 10 seconds
- Configuration errors: Service startup failure with detailed error logging
- Process crashes: Automatic FRP process restart with crash dump collection

**Recovery Mechanisms:**
- Graceful degradation: Automatic fallback to local-only mode during tunnel failures
- State preservation: Persistent tunnel configuration across service restarts
- Health monitoring: Continuous health checks with automatic recovery initiation
- Circuit breaker: Temporary service disable after 5 consecutive failures within 5 minutes
- Manual override: Administrative bypass for automatic recovery mechanisms

**User Communication:**
- Status indicators: Real-time tunnel status display with color-coded indicators
- Error notifications: Toast notifications for critical tunnel failures
- Progress indicators: Visual progress display during tunnel establishment
- Resolution guidance: Context-sensitive help messages for common error conditions
- Support information: Automatic diagnostic information collection for support requests

## Configuration & Environment

### Environment Variables and Configuration Options

**Required Environment Variables:**

**BEEPPHONE_TUNNEL_ENABLED**
- Type: Boolean (true/false)
- Default: true
- Purpose: Global enable/disable for tunnel functionality
- Validation: Must be valid boolean value
- Impact: Service startup behavior and feature availability

**BEEPPHONE_TUNNEL_RELAY_SERVERS**
- Type: Comma-separated string
- Default: "tunnel1.beepphone.dev,tunnel2.beepphone.dev"
- Purpose: List of available relay servers for failover
- Validation: Must be valid hostnames or IP addresses
- Impact: Tunnel connection destinations and failover behavior

**BEEPPHONE_TUNNEL_DEVICE_ID**
- Type: String (UUID format)
- Default: Auto-generated based on hardware fingerprint
- Purpose: Unique device identifier for tunnel URL generation
- Validation: Must be valid UUID v4 format
- Impact: Tunnel URL consistency and device authentication

**Optional Environment Variables:**

**BEEPPHONE_TUNNEL_CUSTOM_SUBDOMAIN**
- Type: String (DNS-safe characters)
- Default: null (uses device ID)
- Purpose: Custom subdomain for tunnel URL
- Validation: Must match DNS subdomain format [a-z0-9-]
- Impact: Public tunnel URL appearance

**BEEPPHONE_TUNNEL_HEARTBEAT_INTERVAL**
- Type: Integer (seconds)
- Default: 30
- Range: 10-300 seconds
- Purpose: Health check frequency configuration
- Impact: Connection monitoring sensitivity and resource usage

**BEEPPHONE_TUNNEL_LOG_LEVEL**
- Type: String (Debug/Information/Warning/Error)
- Default: Information
- Purpose: Tunnel service logging verbosity
- Validation: Must be valid .NET LogLevel value
- Impact: Log output volume and debugging capability

**BEEPPHONE_TUNNEL_ENCRYPTION_ENABLED**
- Type: Boolean (true/false)
- Default: true
- Purpose: Enable/disable additional payload encryption
- Validation: Must be valid boolean value
- Impact: Security level and performance characteristics

### Deployment Requirements

**System Requirements:**
- Operating System: Windows 10 (1903) or later, Windows 11, Windows Server 2019+
- .NET Runtime: .NET 8.0 runtime (automatically installed if missing)
- Memory: Minimum 512MB available RAM, recommended 1GB
- Storage: 100MB free disk space for binaries and logs
- Network: Outbound internet connectivity on configurable port (default 7000)

**Network Requirements:**
- Outbound HTTPS connectivity: Required for relay server communication
- DNS resolution: Ability to resolve tunnel relay server hostnames
- Firewall configuration: Outbound TCP port 7000 (configurable)
- Proxy support: HTTP and SOCKS proxy configuration support
- NAT traversal: Automatic NAT traversal for tunnel establishment

**Security Requirements:**
- Certificate store access: Read access to Windows certificate store
- File system permissions: Read/write access to configuration directory
- Network permissions: Outbound network connection permissions
- Process permissions: Ability to spawn FRP client subprocess
- Registry access: Limited registry access for Windows integration

**High Availability Deployment:**
- Load balancer configuration: Support for multiple relay servers
- Health check endpoints: /health endpoint for load balancer monitoring
- Graceful shutdown: Clean tunnel disconnection on service stop
- Auto-restart capability: Service recovery configuration for Windows Service
- Monitoring integration: Structured logging for external monitoring systems

### Development Environment Setup

**Developer Prerequisites:**
- Visual Studio 2022 (17.8 or later) or Visual Studio Code with C# extension
- .NET 8.0 SDK (8.0.100 or later)
- Git for version control
- Windows 10/11 development machine
- Administrative privileges for service debugging

**Local Development Configuration:**
1. Clone repository and navigate to tunnel component directory
2. Install .NET 8.0 SDK if not already present
3. Run `dotnet restore` in tunnel/app directory
4. Configure development appsettings.Development.json with local relay servers
5. Set BEEPPHONE_TUNNEL_ENABLED=false for local development without external dependencies

**Development Tools Setup:**
- FRP binary: Automatically downloaded during first run or manually placed in tools directory
- Configuration files: Development-specific configuration templates provided
- Logging: Enhanced logging configuration for development with Console and Debug providers
- Testing: Unit test project with mocked external dependencies
- Debugging: Configured launch profiles for tunnel service debugging

**Local Testing Environment:**
- Mock relay server: Docker container for local relay server testing
- Configuration override: Environment variable override for development settings
- Network simulation: Tools for testing network interruption scenarios
- Performance testing: Benchmarking tools for latency and throughput measurement
- Integration testing: Automated tests for complete tunnel establishment flow

### Production Configuration Guidance

**Production Security Configuration:**
- TLS certificate management: Automatic certificate renewal configuration
- Authentication tokens: Secure token generation and rotation policies
- Network security: Firewall rules and network segmentation recommendations
- Audit logging: Comprehensive audit log configuration for compliance
- Encryption: End-to-end encryption configuration for sensitive environments

**Performance Optimization:**
- Connection pooling: Optimal connection pool size configuration
- Memory management: Garbage collection tuning for consistent performance
- Thread management: Optimal thread pool configuration for concurrent operations
- Caching: Strategic caching configuration for frequently accessed data
- Monitoring: Production monitoring and alerting configuration

**Operational Configuration:**
- Log management: Log rotation and retention policies
- Health monitoring: Comprehensive health check configuration
- Backup procedures: Configuration backup and disaster recovery procedures
- Update management: Automated update deployment strategies
- Support procedures: Troubleshooting and support escalation procedures

**Scalability Configuration:**
- Resource limits: Memory and CPU resource limit configuration
- Connection limits: Maximum concurrent connection configuration
- Rate limiting: Production-appropriate rate limiting configuration
- Load balancing: Multi-instance deployment configuration
- Auto-scaling: Dynamic scaling based on load metrics

## Constraints & Limitations

### Technical Constraints

**Network Architecture Limitations:**
- Outbound connectivity requirement: Tunnel service requires reliable outbound internet connectivity to relay servers
- Single tunnel per instance: Each BeepMyPhone instance supports one active tunnel connection
- Port availability: Requires available outbound TCP port (configurable, default 7000)
- DNS dependency: Relies on DNS resolution for relay server connectivity
- NAT traversal limitations: Some symmetric NAT configurations may require manual firewall configuration

**Platform-Specific Constraints:**
- Windows-only deployment: Currently supports Windows operating systems only
- .NET 8.0 requirement: Requires .NET 8.0 runtime installation
- Process privileges: Requires sufficient privileges to spawn FRP subprocess
- File system access: Requires read/write access to configuration directories
- Windows Service integration: Designed for Windows Service deployment model

**Resource Utilization Constraints:**
- Memory overhead: Minimum 50MB additional memory usage for tunnel functionality
- CPU utilization: Up to 5% CPU usage during tunnel establishment
- Bandwidth overhead: Approximately 10% protocol overhead for tunneled traffic
- Storage requirements: 100MB disk space for binaries and configuration
- Connection limits: Maximum 50 concurrent mobile device connections per tunnel

### Performance Limitations

**Latency Impact:**
- Additional latency: 50-200ms additional latency compared to direct local network connection
- Tunnel establishment time: 3-10 seconds for initial tunnel creation
- Health check overhead: 30-second intervals may delay failure detection
- Geographic limitations: Latency increases with distance to nearest relay server
- Network quality dependency: Performance heavily dependent on user's internet connection quality

**Throughput Limitations:**
- Protocol overhead: 10-15% throughput reduction due to tunneling protocol encapsulation
- Relay server capacity: Throughput limited by relay server infrastructure capacity
- Network path constraints: Throughput limited by slowest network segment in tunnel path
- Compression efficiency: Variable compression ratios depending on notification content types
- Concurrent connection impact: Throughput per connection decreases with total connection count

**Scalability Limitations:**
- Single instance design: Does not support clustering or horizontal scaling
- Device connection limits: Maximum 50 simultaneous mobile device connections
- Notification throughput: Maximum 100 notifications per second sustained throughput
- Memory growth: Memory usage increases linearly with connection count
- Configuration complexity: Complex configurations may impact startup and performance

### Platform-Specific Restrictions

**Windows Version Compatibility:**
- Minimum Windows version: Windows 10 build 1903 or later required
- Windows Server support: Limited to Windows Server 2019 and later
- Legacy system limitations: No support for Windows 7, Windows 8, or Windows Server 2016
- Windows S mode: Not compatible with Windows 10/11 S mode due to unsigned binary requirements
- ARM64 limitations: Limited testing on ARM64 Windows devices

**Corporate Environment Restrictions:**
- Group Policy constraints: May be restricted by corporate Group Policy settings
- Antivirus interference: Some antivirus solutions may interfere with tunnel operation
- Proxy requirements: Corporate proxy configurations may require additional setup
- Certificate requirements: Corporate environments may require custom certificate validation
- Network restrictions: Corporate firewalls may block required outbound connections

**Development and Deployment Restrictions:**
- Code signing requirements: Production deployment may require code signing certificates
- Windows Defender SmartScreen: May trigger SmartScreen warnings on first installation
- UAC elevation: May require administrative privileges for initial setup
- Service installation: Requires administrative privileges for Windows Service installation
- Auto-update limitations: Automatic updates may be restricted in enterprise environments

### Known Issues and Workarounds

**FRP Binary Download Issues:**
- Issue: Automatic FRP binary download may fail in restricted network environments
- Workaround: Manual FRP binary placement in designated tools directory
- Impact: Tunnel service startup failure
- Resolution timeline: Planned offline installer package in version 2.0

**Network Interruption Recovery:**
- Issue: Extended network interruptions (>5 minutes) may require manual tunnel restart
- Workaround: Automatic service restart via Windows Service recovery configuration
- Impact: Temporary loss of cross-network connectivity
- Resolution timeline: Enhanced recovery mechanisms planned for version 1.1

**QR Code Display Issues:**
- Issue: QR codes may be difficult to scan on high-DPI displays
- Workaround: Manual scaling adjustment in browser zoom settings
- Impact: Reduced mobile device setup convenience
- Resolution timeline: Dynamic QR code scaling implementation in version 1.1

**Corporate Proxy Compatibility:**
- Issue: Some corporate proxy configurations require manual authentication
- Workaround: Direct proxy configuration in FRP configuration file
- Impact: Manual configuration required in some corporate environments
- Resolution timeline: Enhanced proxy auto-detection in version 1.2

**Relay Server Failover Delays:**
- Issue: Failover to backup relay servers may take up to 60 seconds
- Workaround: Manual tunnel restart for faster recovery
- Impact: Extended service interruption during primary relay server outages
- Resolution timeline: Improved failover mechanisms in version 1.1

**Log File Growth:**
- Issue: Tunnel service logs may grow large over extended operation periods
- Workaround: Configure log rotation policies and regular log cleanup
- Impact: Disk space consumption over time
- Resolution timeline: Automatic log management features in version 1.1