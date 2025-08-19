import { AppLayout } from './components/layout/AppLayout'
import './styles/layout.css'
import './App.css'

function App() {
  return (
    <AppLayout title="BeepMyPhone" showTitleBar={true}>
      <div className="text-center">
        <h1 className="app-heading mb-4">
          BeepMyPhone Desktop
        </h1>
        <p className="app-description mb-8">
          PC-to-Phone Notification Forwarding System
        </p>
        <div className="status-card">
          <h2 className="status-card-title mb-3">
            Application Layout Complete
          </h2>
          <p className="status-card-content">
            The foundational layout structure is now in place. 
            Future objectives will add device management, connection status, 
            settings, and notification features to this framework.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}

export default App
