using Microsoft.AspNetCore.Mvc;

namespace WindowsNotificationService.Controllers;

/// <summary>
/// API controller for managing application settings
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class SettingsController : ControllerBase
{
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(ILogger<SettingsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Gets current application settings
    /// </summary>
    /// <returns>Application settings</returns>
    /// <response code="200">Returns current settings</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public ActionResult<object> GetSettings()
    {
        try
        {
            var settings = new
            {
                notifications = new
                {
                    enabled = true,
                    autoStart = true,
                    minimizeToTray = true,
                    showPreview = true,
                    soundEnabled = true
                },
                devices = new
                {
                    autoAcceptRegistrations = false,
                    maxDevices = 10,
                    requireDeviceAuth = true
                },
                appearance = new
                {
                    theme = "system", // "light", "dark", "system"
                    compactMode = false,
                    animationsEnabled = true
                },
                advanced = new
                {
                    debugMode = false,
                    logLevel = "Info",
                    dataRetentionDays = 30
                }
            };

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting settings");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Updates application settings
    /// </summary>
    /// <param name="settings">Updated settings</param>
    /// <returns>Updated settings</returns>
    /// <response code="200">Settings updated successfully</response>
    /// <response code="400">Invalid settings data</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public ActionResult<object> UpdateSettings([FromBody] object settings)
    {
        try
        {
            // For now, just return the submitted settings
            // In a real implementation, you'd persist these to a database or config file
            _logger.LogInformation("Settings updated: {Settings}", settings);
            
            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating settings");
            return StatusCode(500, "Internal server error");
        }
    }
}