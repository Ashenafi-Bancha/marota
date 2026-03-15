
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import AppRouter from './app/router/AppRouter.jsx';
import './index.css';
import { AuthProvider } from './features/auth/context/AuthProvider.jsx';
import { ThemeProvider } from './app/providers/ThemeProvider.jsx';


createRoot(document.getElementById('root')).render(
    <ThemeProvider>
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    </ThemeProvider>
    
    
    
)
