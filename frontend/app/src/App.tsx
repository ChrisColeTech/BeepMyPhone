import { AppRouter } from './router/AppRouter';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  console.log('🚀 BeepMyPhone App.tsx is loading!');
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App