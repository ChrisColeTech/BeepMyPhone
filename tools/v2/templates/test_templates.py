#!/usr/bin/env python3
"""
Test templates for both frontend and backend projects.
"""

from pathlib import Path
from typing import Dict, Any
from templates.base_templates import TestTemplate


class BackendTestTemplate(TestTemplate):
    """Template for backend Node.js tests."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        # Extract component name from test filename
        test_name = file_path.stem.replace('.test', '').replace('.spec', '')
        class_name = self.get_class_name_from_filename(test_name)
        
        # Calculate import path (tests are usually in tests/ directory)
        import_path = self._calculate_backend_import_path(file_path, test_name)
        
        return f"""import {{ describe, it, expect, beforeEach, afterEach }} from '@jest/globals'
import {{ {class_name} }} from '{import_path}'

describe('{class_name}', () => {{
  let instance: {class_name}
  
  beforeEach(() => {{
    instance = new {class_name}()
  }})
  
  afterEach(() => {{
    // Cleanup
  }})
  
  describe('constructor', () => {{
    it('should create instance correctly', () => {{
      expect(instance).toBeInstanceOf({class_name})
    }})
  }})
  
  describe('basic functionality', () => {{
    it('should handle basic operations', async () => {{
      // TODO: Add test implementation
      expect(true).toBe(true)
    }})
    
    it('should handle error cases', async () => {{
      // TODO: Add error handling tests
      expect(true).toBe(true)
    }})
  }})
  
  // TODO: Add more specific test cases
}})
"""
    
    def _calculate_backend_import_path(self, test_path: Path, component_name: str) -> str:
        """Calculate import path for backend tests."""
        path_parts = test_path.parts
        
        if 'tests' in path_parts:
            tests_index = path_parts.index('tests')
            relative_parts = path_parts[tests_index + 1:-1]  # exclude filename
            
            # For backend, usually import from src/
            if relative_parts:
                # tests/unit/services/auth -> ../../src/services/auth
                dots = '../' * (len(relative_parts) + 1)
                return f"{dots}src/{'/'.join(relative_parts)}/{component_name}"
            else:
                # tests/SomeClass.test.ts -> ../src/SomeClass
                return f"../src/{component_name}"
        
        return f"./{component_name}"


class IntegrationTestTemplate(TestTemplate):
    """Template for integration tests."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        test_name = file_path.stem.replace('.test', '').replace('.spec', '')
        feature_name = test_name.replace('-', ' ').title()
        
        is_frontend = 'frontend' in str(file_path)
        
        if is_frontend:
            return self._generate_frontend_integration_test(feature_name)
        else:
            return self._generate_backend_integration_test(feature_name)
    
    def _generate_frontend_integration_test(self, feature_name: str) -> str:
        return f"""import React from 'react'
import {{ render, screen, fireEvent, waitFor }} from '@testing-library/react'
import {{ Provider }} from 'react-redux'
import {{ BrowserRouter }} from 'react-router-dom'
import {{ store }} from '../../store'

// TODO: Import the components/pages being tested
// import {{ SomeComponent }} from '../../components/...'

const renderWithProviders = (component: React.ReactElement) => {{
  return render(
    <Provider store={{store}}>
      <BrowserRouter>
        {{component}}
      </BrowserRouter>
    </Provider>
  )
}}

describe('{feature_name} Integration', () => {{
  beforeEach(() => {{
    // Reset any mocks or state
  }})
  
  it('should complete the full {feature_name.lower()} workflow', async () => {{
    // TODO: Implement integration test
    // 1. Render the main component
    // 2. Simulate user interactions
    // 3. Assert the expected outcomes
    
    // Example:
    // renderWithProviders(<SomeComponent />)
    // fireEvent.click(screen.getByRole('button', {{ name: /submit/i }}))
    // await waitFor(() => expect(screen.getByText(/success/i)).toBeInTheDocument())
    
    expect(true).toBe(true) // TODO: Replace with actual assertions
  }})
  
  it('should handle error scenarios in {feature_name.lower()}', async () => {{
    // TODO: Test error handling
    expect(true).toBe(true) // TODO: Replace with actual assertions
  }})
  
  // TODO: Add more integration test scenarios
}})
"""
    
    def _generate_backend_integration_test(self, feature_name: str) -> str:
        return f"""import {{ describe, it, expect, beforeAll, afterAll, beforeEach }} from '@jest/globals'
import request from 'supertest'
import {{ app }} from '../../src/app'
// TODO: Import database setup utilities
// import {{ setupTestDatabase, cleanupTestDatabase }} from '../helpers/database'

describe('{feature_name} Integration', () => {{
  beforeAll(async () => {{
    // Setup test database and server
    // await setupTestDatabase()
  }})
  
  afterAll(async () => {{
    // Cleanup test database
    // await cleanupTestDatabase()
  }})
  
  beforeEach(async () => {{
    // Reset database state for each test
  }})
  
  describe('API Endpoints', () => {{
    it('should handle complete {feature_name.lower()} workflow via API', async () => {{
      // TODO: Test the full API workflow
      // Example:
      // const response = await request(app)
      //   .post('/api/{feature_name.lower().replace(" ", "-")}')
      //   .send({{ data: 'test' }})
      //   .expect(200)
      // 
      // expect(response.body).toHaveProperty('success', true)
      
      expect(true).toBe(true) // TODO: Replace with actual API tests
    }})
    
    it('should validate input data properly', async () => {{
      // TODO: Test input validation
      expect(true).toBe(true) // TODO: Replace with actual validation tests
    }})
    
    it('should handle authentication and authorization', async () => {{
      // TODO: Test auth scenarios
      expect(true).toBe(true) // TODO: Replace with actual auth tests
    }})
  }})
  
  describe('Service Integration', () => {{
    it('should integrate services correctly for {feature_name.lower()}', async () => {{
      // TODO: Test service layer integration
      expect(true).toBe(true) // TODO: Replace with actual service tests
    }})
  }})
  
  // TODO: Add more integration test scenarios
}})
"""


class E2ETestTemplate(TestTemplate):
    """Template for end-to-end tests."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        test_name = file_path.stem.replace('.e2e', '').replace('.test', '')
        feature_name = test_name.replace('-', ' ').title()
        
        return f"""import {{ describe, it, expect, beforeAll, afterAll, beforeEach }} from '@jest/globals'
// TODO: Import E2E testing framework (Playwright, Cypress, etc.)
// import {{ Page, Browser }} from 'playwright'

describe('{feature_name} E2E', () => {{
  // let browser: Browser
  // let page: Page
  
  beforeAll(async () => {{
    // Setup browser and page
    // browser = await playwright.chromium.launch()
    // page = await browser.newPage()
  }})
  
  afterAll(async () => {{
    // Cleanup browser
    // await browser.close()
  }})
  
  beforeEach(async () => {{
    // Navigate to test page
    // await page.goto('http://localhost:3000')
  }})
  
  it('should complete {feature_name.lower()} end-to-end', async () => {{
    // TODO: Implement E2E test scenario
    // Example:
    // await page.click('[data-testid="login-button"]')
    // await page.fill('[data-testid="username"]', 'testuser')
    // await page.fill('[data-testid="password"]', 'testpass')
    // await page.click('[data-testid="submit"]')
    // await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
    
    expect(true).toBe(true) // TODO: Replace with actual E2E tests
  }})
  
  it('should handle {feature_name.lower()} error scenarios', async () => {{
    // TODO: Test error scenarios in E2E context
    expect(true).toBe(true) // TODO: Replace with actual error tests
  }})
  
  it('should work across different devices and browsers', async () => {{
    // TODO: Test responsive design and cross-browser compatibility
    expect(true).toBe(true) // TODO: Replace with actual compatibility tests
  }})
  
  // TODO: Add more E2E test scenarios
}})
"""


class PerformanceTestTemplate(TestTemplate):
    """Template for performance tests."""
    
    def generate(self, file_path: Path, context: Dict[str, Any]) -> str:
        test_name = file_path.stem.replace('.test', '').replace('.spec', '')
        component_name = test_name.replace('-', ' ').title()
        
        return f"""import {{ describe, it, expect, beforeEach }} from '@jest/globals'
// TODO: Import performance testing utilities
// import {{ performance }} from 'perf_hooks'

describe('{component_name} Performance', () => {{
  beforeEach(() => {{
    // Reset performance counters
  }})
  
  it('should complete operations within acceptable time limits', async () => {{
    const startTime = performance.now()
    
    // TODO: Execute the operation being tested
    // await someOperation()
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // TODO: Adjust time limits based on requirements
    expect(duration).toBeLessThan(1000) // Should complete within 1 second
  }})
  
  it('should handle concurrent operations efficiently', async () => {{
    const concurrentOperations = 10
    const promises = []
    
    const startTime = performance.now()
    
    for (let i = 0; i < concurrentOperations; i++) {{
      // TODO: Add concurrent operations
      // promises.push(someOperation())
    }}
    
    await Promise.all(promises)
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // TODO: Adjust time limits based on requirements
    expect(duration).toBeLessThan(5000) // Should handle 10 operations within 5 seconds
  }})
  
  it('should have acceptable memory usage', async () => {{
    const initialMemory = process.memoryUsage().heapUsed
    
    // TODO: Execute memory-intensive operation
    // await memoryIntensiveOperation()
    
    const finalMemory = process.memoryUsage().heapUsed
    const memoryIncrease = finalMemory - initialMemory
    
    // TODO: Adjust memory limits based on requirements
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Should not increase memory by more than 50MB
  }})
  
  it('should scale properly with increased load', async () => {{
    // TODO: Implement load scaling tests
    const loads = [1, 10, 100, 1000]
    
    for (const load of loads) {{
      const startTime = performance.now()
      
      // TODO: Execute operation with specific load
      // await operationWithLoad(load)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // TODO: Define acceptable scaling limits
      console.log(`Load ${{load}}: ${{duration}}ms`)
      expect(duration).toBeLessThan(load * 10) // Linear scaling tolerance
    }}
  }})
  
  // TODO: Add more performance test scenarios
}})
"""