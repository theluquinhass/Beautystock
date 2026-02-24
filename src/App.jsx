import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PlanProvider } from './hooks/usePlan';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import RequirePro from './components/RequirePro';
import { Loader2 } from 'lucide-react';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProductList = lazy(() => import('./pages/Products/ProductList'));
const ProductForm = lazy(() => import('./pages/Products/ProductForm'));
const Movements = lazy(() => import('./pages/Movements'));

// Direct import to avoid potential lazy loading issues
import MovementForm from './pages/Movements/MovementForm';
const Account = lazy(() => import('./pages/Account'));
const CustomersList = lazy(() => import('./pages/Customers/CustomersList'));
const CustomerFormPage = lazy(() => import('./pages/Customers/CustomerFormPage'));
const CustomerView = lazy(() => import('./pages/Customers/CustomerView'));
const Upgrade = lazy(() => import('./pages/Upgrade'));

const PageLoader = () => (
  <div className="h-screen flex items-center justify-center text-pink-500">
    <Loader2 className="animate-spin" size={32} />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlanProvider>
          <Toaster position="top-right" />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/produtos" element={<ProductList />} />
                  <Route path="/produtos/novo" element={<ProductForm />} />
                  <Route path="/produtos/:id" element={<ProductForm />} />
                  <Route path="/movimentacoes" element={<Movements />} />
                  <Route path="/movimentacoes/nova" element={<MovementForm />} />
                  <Route path="/conta" element={<Account />} />

                  {/* PRO Protected Routes */}
                  <Route path="/clientes" element={<RequirePro><CustomersList /></RequirePro>} />
                  <Route path="/clientes/novo" element={<RequirePro><CustomerFormPage /></RequirePro>} />
                  <Route path="/clientes/:id" element={<RequirePro><CustomerView /></RequirePro>} />
                  <Route path="/clientes/:id/editar" element={<RequirePro><CustomerFormPage /></RequirePro>} />

                  <Route path="/upgrade" element={<Upgrade />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

