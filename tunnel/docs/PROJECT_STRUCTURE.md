# BeepMyPhone Tunneling Project Structure (Simple Format)

This document provides a simplified, parser-friendly version of the project structure.

## FILE_LIST

### Configuration Files
app/BeepMyPhone.Tunneling.csproj
app/appsettings.json
app/appsettings.Development.json
app/appsettings.Production.json

### Binary Management - FRP Download and Validation (Objective 1)
app/src/Services/BinaryManagement/FrpBinaryManager.cs
app/src/Services/BinaryManagement/IBinaryDownloadSource.cs
app/src/Services/BinaryManagement/GitHubReleaseBinarySource.cs
app/src/Services/BinaryManagement/LocalCacheBinarySource.cs
app/src/Models/BinaryManagement/BinaryInfo.cs
app/src/Models/BinaryManagement/PlatformInfo.cs
app/src/Services/BinaryManagement/BinaryValidationService.cs
app/src/Services/BinaryManagement/IBinaryValidationService.cs

### Configuration Management - Settings and Hot-Reload (Objective 2, 14)
app/src/Services/Configuration/TunnelConfigurationService.cs
app/src/Services/Configuration/ITunnelConfigurationService.cs
app/src/Models/Configuration/TunnelConfiguration.cs
app/src/Models/Configuration/RelayServerConfiguration.cs
app/src/Models/Configuration/SecurityConfiguration.cs
app/src/Models/Configuration/PerformanceConfiguration.cs
app/src/Services/Configuration/ConfigurationValidationService.cs
app/src/Services/Configuration/IConfigurationValidationService.cs
app/src/Services/Configuration/ConfigurationFileWatcher.cs
app/src/Services/Configuration/ConfigurationHotReloadService.cs
app/src/Services/Configuration/IConfigurationHotReloadService.cs
app/src/Services/Configuration/IConfigurationChangeHandler.cs
app/src/Services/Configuration/TunnelConfigurationChangeHandler.cs
app/src/Models/Configuration/ConfigurationChange.cs
app/src/Models/Configuration/ConfigurationChangeResult.cs
app/src/Services/Configuration/ConfigurationBackupService.cs

### Process Management - FRP Lifecycle (Objective 3)
app/src/Services/ProcessManagement/FrpProcessManager.cs
app/src/Services/ProcessManagement/IFrpProcessManager.cs
app/src/Services/ProcessManagement/ProcessEventArgs.cs
app/src/Services/ProcessManagement/FrpConfigurationGenerator.cs
app/src/Services/ProcessManagement/IFrpConfigurationGenerator.cs
app/src/Models/ProcessManagement/ProcessStatus.cs
app/src/Models/ProcessManagement/FrpConfiguration.cs
app/src/Services/ProcessManagement/ProcessOutputParser.cs

### URL Parsing - Tunnel URL Detection (Objective 4)
app/src/Services/UrlParsing/TunnelUrlParser.cs
app/src/Services/UrlParsing/ITunnelUrlParser.cs
app/src/Services/UrlParsing/FrpOutputParser.cs
app/src/Services/UrlParsing/IFrpOutputParser.cs
app/src/Models/UrlParsing/TunnelUrlInfo.cs
app/src/Models/UrlParsing/ParseResult.cs
app/src/Services/UrlParsing/UrlValidationService.cs
app/src/Services/UrlParsing/IUrlValidationService.cs

### Health Monitoring - Connection Status (Objective 5)
app/src/Services/Health/TunnelHealthMonitor.cs
app/src/Services/Health/ITunnelHealthMonitor.cs
app/src/Services/Health/HealthCheckResult.cs
app/src/Services/Health/IHealthCheck.cs
app/src/Services/Health/HttpHealthCheck.cs
app/src/Services/Health/TcpHealthCheck.cs
app/src/Models/Health/HealthStatus.cs
app/src/Models/Health/HealthMetrics.cs
app/src/Services/Health/HealthStatusEventArgs.cs

### Reconnection Logic - Automatic Recovery (Objective 6)
app/src/Services/Reconnection/TunnelReconnectionManager.cs
app/src/Services/Reconnection/ITunnelReconnectionManager.cs
app/src/Services/Reconnection/IReconnectionStrategy.cs
app/src/Services/Reconnection/ExponentialBackoffStrategy.cs
app/src/Services/Reconnection/LinearBackoffStrategy.cs
app/src/Models/Reconnection/ReconnectionAttempt.cs
app/src/Models/Reconnection/ConnectionState.cs
app/src/Services/Reconnection/FailureClassificationService.cs
app/src/Services/Reconnection/IFailureClassificationService.cs

### Status Management - Real-time Status (Objective 7)
app/src/Services/Status/TunnelStatusManager.cs
app/src/Services/Status/ITunnelStatusManager.cs
app/src/Models/Status/TunnelStatus.cs
app/src/Models/Status/StatusSummary.cs
app/src/Models/Status/StatusHistory.cs
app/src/Services/Status/StatusAggregationService.cs
app/src/Services/Status/IStatusAggregationService.cs
app/src/Services/Status/StatusChangeEventArgs.cs
app/src/Services/Status/StatusPersistenceService.cs

### QR Code Generation - Mobile Setup (Objective 8)
app/src/Services/QrCode/QrCodeGenerationService.cs
app/src/Services/QrCode/IQrCodeGenerationService.cs
app/src/Models/QrCode/QrCodeContent.cs
app/src/Models/QrCode/QrCodeOptions.cs
app/src/Services/QrCode/QrCodeContentBuilder.cs
app/src/Services/QrCode/IQrCodeContentBuilder.cs
app/src/Services/QrCode/ImageProcessor.cs
app/src/Services/QrCode/IImageProcessor.cs

### API Management - REST Endpoints (Objective 9)
app/src/Controllers/TunnelController.cs
app/src/Models/Api/TunnelStatusResponse.cs
app/src/Models/Api/TunnelRestartRequest.cs
app/src/Models/Api/ApiResponse.cs
app/src/Models/Api/ErrorResponse.cs
app/src/Services/Api/TunnelControlService.cs
app/src/Services/Api/ITunnelControlService.cs
app/src/Services/Api/TunnelQueryService.cs
app/src/Services/Api/ITunnelQueryService.cs

### Error Handling - Recovery Systems (Objective 10)
app/src/Services/ErrorHandling/TunnelErrorHandler.cs
app/src/Services/ErrorHandling/ITunnelErrorHandler.cs
app/src/Models/ErrorHandling/TunnelError.cs
app/src/Models/ErrorHandling/ErrorSeverity.cs
app/src/Models/ErrorHandling/RecoveryResult.cs
app/src/Services/ErrorHandling/ErrorClassificationService.cs
app/src/Services/ErrorHandling/IErrorClassificationService.cs
app/src/Services/ErrorHandling/ErrorRecoveryService.cs
app/src/Services/ErrorHandling/IErrorRecoveryService.cs

### Failover Management - Server Switching (Objective 11)
app/src/Services/Failover/RelayServerManager.cs
app/src/Services/Failover/IRelayServerManager.cs
app/src/Services/Failover/IServerSelector.cs
app/src/Services/Failover/GeographicServerSelector.cs
app/src/Services/Failover/PerformanceServerSelector.cs
app/src/Models/Failover/RelayServerInfo.cs
app/src/Models/Failover/ServerHealthStatus.cs
app/src/Services/Failover/ServerHealthChecker.cs
app/src/Services/Failover/IServerHealthChecker.cs

### Security Services - Authentication and Encryption (Objective 12)
app/src/Services/Security/TunnelSecurityService.cs
app/src/Services/Security/ITunnelSecurityService.cs
app/src/Services/Security/DeviceAuthenticationService.cs
app/src/Services/Security/IDeviceAuthenticationService.cs
app/src/Services/Security/TokenManagementService.cs
app/src/Services/Security/ITokenManagementService.cs
app/src/Models/Security/DeviceCredentials.cs
app/src/Models/Security/AuthenticationToken.cs
app/src/Services/Security/EncryptionService.cs

### Performance Monitoring - Metrics Collection (Objective 13)
app/src/Services/Performance/TunnelPerformanceMonitor.cs
app/src/Services/Performance/ITunnelPerformanceMonitor.cs
app/src/Models/Performance/PerformanceMetrics.cs
app/src/Models/Performance/MetricSnapshot.cs
app/src/Services/Performance/MetricsCollector.cs
app/src/Services/Performance/IMetricsCollector.cs
app/src/Services/Performance/MetricsAggregationService.cs
app/src/Services/Performance/IMetricsAggregationService.cs

### Integration Services - Backend Integration (Objective 15)
app/src/Integration/TunnelServiceRegistration.cs
app/src/Integration/TunnelServiceCollectionExtensions.cs
app/src/Integration/ITunnelServiceIntegration.cs
app/src/Integration/TunnelServiceIntegration.cs
app/src/Integration/TunnelHostedService.cs
app/src/Integration/TunnelServiceConfiguration.cs
app/src/Models/Integration/IntegrationOptions.cs
app/src/Models/Integration/ServiceHealthCheck.cs

### Test Files - Unit Tests - Binary Management
app/tests/unit/Services/BinaryManagement/FrpBinaryManagerTests.cs
app/tests/unit/Services/BinaryManagement/BinaryValidationServiceTests.cs

### Test Files - Unit Tests - Configuration
app/tests/unit/Services/Configuration/TunnelConfigurationServiceTests.cs
app/tests/unit/Services/Configuration/ConfigurationValidationServiceTests.cs
app/tests/unit/Services/Configuration/ConfigurationHotReloadServiceTests.cs
app/tests/unit/Services/Configuration/TunnelConfigurationChangeHandlerTests.cs

### Test Files - Unit Tests - Process Management
app/tests/unit/Services/ProcessManagement/FrpProcessManagerTests.cs
app/tests/unit/Services/ProcessManagement/FrpConfigurationGeneratorTests.cs

### Test Files - Unit Tests - URL Parsing
app/tests/unit/Services/UrlParsing/TunnelUrlParserTests.cs
app/tests/unit/Services/UrlParsing/FrpOutputParserTests.cs
app/tests/unit/Services/UrlParsing/UrlValidationServiceTests.cs

### Test Files - Unit Tests - Health Monitoring
app/tests/unit/Services/Health/TunnelHealthMonitorTests.cs
app/tests/unit/Services/Health/HttpHealthCheckTests.cs

### Test Files - Unit Tests - Reconnection Logic
app/tests/unit/Services/Reconnection/TunnelReconnectionManagerTests.cs
app/tests/unit/Services/Reconnection/ExponentialBackoffStrategyTests.cs

### Test Files - Unit Tests - Status Management
app/tests/unit/Services/Status/TunnelStatusManagerTests.cs
app/tests/unit/Services/Status/StatusAggregationServiceTests.cs

### Test Files - Unit Tests - QR Code Generation
app/tests/unit/Services/QrCode/QrCodeGenerationServiceTests.cs
app/tests/unit/Services/QrCode/QrCodeContentBuilderTests.cs

### Test Files - Unit Tests - API Management
app/tests/unit/Controllers/TunnelControllerTests.cs
app/tests/unit/Services/Api/TunnelControlServiceTests.cs

### Test Files - Unit Tests - Error Handling
app/tests/unit/Services/ErrorHandling/TunnelErrorHandlerTests.cs
app/tests/unit/Services/ErrorHandling/ErrorClassificationServiceTests.cs

### Test Files - Unit Tests - Failover Management
app/tests/unit/Services/Failover/RelayServerManagerTests.cs
app/tests/unit/Services/Failover/GeographicServerSelectorTests.cs

### Test Files - Unit Tests - Security
app/tests/unit/Services/Security/TunnelSecurityServiceTests.cs
app/tests/unit/Services/Security/DeviceAuthenticationServiceTests.cs

### Test Files - Unit Tests - Performance Monitoring
app/tests/unit/Services/Performance/TunnelPerformanceMonitorTests.cs
app/tests/unit/Services/Performance/MetricsCollectorTests.cs

### Test Files - Unit Tests - Integration
app/tests/unit/Integration/TunnelServiceRegistrationTests.cs
app/tests/unit/Integration/TunnelHostedServiceTests.cs

### Test Files - Integration Tests - Binary Management
app/tests/integration/Services/BinaryManagement/BinaryDownloadIntegrationTests.cs

### Test Files - Integration Tests - Configuration
app/tests/integration/Services/Configuration/ConfigurationReloadTests.cs
app/tests/integration/Services/Configuration/HotReloadIntegrationTests.cs

### Test Files - Integration Tests - Process Management
app/tests/integration/Services/ProcessManagement/ProcessLifecycleIntegrationTests.cs

### Test Files - Integration Tests - Health Monitoring
app/tests/integration/Services/Health/HealthMonitoringIntegrationTests.cs

### Test Files - Integration Tests - Reconnection Logic
app/tests/integration/Services/Reconnection/ReconnectionIntegrationTests.cs

### Test Files - Integration Tests - Status Management
app/tests/integration/Services/Status/StatusPersistenceIntegrationTests.cs

### Test Files - Integration Tests - QR Code Generation
app/tests/integration/Services/QrCode/QrCodeIntegrationTests.cs

### Test Files - Integration Tests - API Management
app/tests/integration/Controllers/TunnelApiIntegrationTests.cs

### Test Files - Integration Tests - Error Handling
app/tests/integration/Services/ErrorHandling/ErrorRecoveryIntegrationTests.cs

### Test Files - Integration Tests - Failover Management
app/tests/integration/Services/Failover/FailoverIntegrationTests.cs

### Test Files - Integration Tests - Security
app/tests/integration/Services/Security/SecurityIntegrationTests.cs

### Test Files - Integration Tests - Performance Monitoring
app/tests/integration/Services/Performance/PerformanceMonitoringIntegrationTests.cs

### Test Files - Integration Tests - Integration
app/tests/integration/Integration/BackendIntegrationTests.cs

### Build and Configuration Support
app/bin/Debug/net8.0/BeepMyPhone.Tunneling.dll
app/obj/Debug/net8.0/BeepMyPhone.Tunneling.pdb
app/obj/project.assets.json
app/obj/BeepMyPhone.Tunneling.csproj.nuget.dgspec.json