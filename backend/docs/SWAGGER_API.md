# Windows Notification Service API Documentation

## Swagger/OpenAPI Integration

The Windows Notification Service now includes comprehensive API documentation via Swagger/OpenAPI.

### Accessing the API Documentation

Once the service is running, you can access the interactive API documentation at:

**Swagger UI**: http://localhost:5001/swagger/index.html

**Raw OpenAPI JSON**: http://localhost:5001/swagger/v1/swagger.json

### Available Endpoints

#### GET /api/notifications/recent
- **Description**: Retrieves recent Windows notifications
- **Parameters**: 
  - `count` (optional): Maximum number of notifications (1-100, default: 10)
- **Responses**: 
  - 200: List of WindowsNotification objects
  - 400: Invalid count parameter
  - 500: Internal server error

#### GET /api/notifications/status
- **Description**: Gets the current monitoring service status
- **Responses**:
  - 200: Service status object with IsMonitoring, ServiceName, and Timestamp

#### GET /health
- **Description**: Basic health check endpoint
- **Responses**:
  - 200: "Windows Notification Service is running"

### Data Models

#### WindowsNotification
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "appName": "Microsoft Teams",
  "title": "New message from John Doe", 
  "message": "Hey, are you available for a quick call?",
  "timestamp": "2024-01-15T10:30:00Z",
  "rawPayload": "...",
  "notificationType": 0
}
```

**NotificationType Values:**
- 0: Information
- 1: Warning  
- 2: Error

### Testing the API

You can test the API directly from the Swagger UI interface, or using curl commands:

```bash
# Get service status
curl http://localhost:5001/api/notifications/status

# Get recent notifications
curl 'http://localhost:5001/api/notifications/recent?count=5'

# Health check
curl http://localhost:5001/health
```

### Features

- **Interactive Documentation**: Full Swagger UI with try-it-out functionality
- **Request/Response Examples**: Detailed examples for all endpoints
- **Data Model Documentation**: Complete schema documentation with examples
- **Input Validation**: Built-in parameter validation with clear error messages
- **Contact Information**: API contact details included in documentation

The Swagger integration includes XML documentation comments that provide detailed descriptions, parameter information, and response examples for a comprehensive API reference.