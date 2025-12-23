import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/Layout';
import jubilantTheme from './theme/jubilantTheme';
import Loading from './components/common/Loading';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OpexTracker from './pages/BudgetList'; // Re-using BudgetList as the main Tracker
import MasterData from './pages/MasterData';
import UserManagement from './pages/UserManagement';
import ImportHistory from './pages/ImportHistory';
import NetBudget from './pages/NetBudget';
import AllocationBase from './pages/AllocationBase';
import NetActual from './pages/NetActual';
import ActualsList from './pages/ActualsList';
import POList from './pages/POList';

const ProtectedRoute = ({ children }) => {
    const { token, isLoading } = useAuth();
    if (isLoading) return <Loading fullScreen />;
    return token ? children : <Navigate to="/login" />;
};

import { ThemeProvider as AppThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <AppErrorBoundary>
            <AuthProvider>
                <AppThemeProvider>
                    <ThemeProvider theme={jubilantTheme}>
                        <CssBaseline />
                        <Router>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/" element={
                                    <ProtectedRoute>
                                        <Layout />
                                    </ProtectedRoute>
                                }>
                                    <Route index element={<Dashboard />} />
                                    <Route path="tracker" element={<OpexTracker />} />
                                    <Route path="master-data" element={<MasterData />} />
                                    <Route path="users" element={<UserManagement />} />
                                    <Route path="imports" element={<ImportHistory />} />
                                    <Route path="net-budget" element={<NetBudget />} />
                                    <Route path="allocation-base" element={<AllocationBase />} />
                                    <Route path="actuals" element={<ActualsList />} />
                                    <Route path="net-actual" element={<NetActual />} />
                                    <Route path="pos" element={<POList />} />
                                    {/* Redirect legacy paths to new unified tracker */}
                                    <Route path="budgets" element={<Navigate to="/tracker" replace />} />
                                    <Route path="actuals" element={<Navigate to="/tracker" replace />} />
                                </Route>
                            </Routes>
                        </Router>
                    </ThemeProvider>
                </AppThemeProvider>
            </AuthProvider>
        </AppErrorBoundary>
    );
}

export default App;
