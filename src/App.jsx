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
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProductList = lazy(() => import('./pages/Products/ProductList'));
const ProductForm = lazy(() => import('./pages/Products/ProductForm'));
const Movements = lazy(() => import('./pages/Movements'));

import { OnboardingProvider } from './contexts/OnboardingContext';
import BibiOnboardingFlow from './components/Onboarding/BibiOnboardingFlow';

// Direct import to avoid potential lazy loading issues
import MovementForm from './pages/Movements/MovementForm';
const Account = lazy(() => import('./pages/Account'));
const Categories = lazy(() => import('./pages/Categories'));
const CatalogSettings = lazy(() => import('./pages/CatalogSettings'));
const PublicCatalog = lazy(() => import('./pages/PublicCatalog'));
const CustomersList = lazy(() => import('./pages/Customers/CustomersList'));
const CustomerFormPage = lazy(() => import('./pages/Customers/CustomerFormPage'));
const CustomerView = lazy(() => import('./pages/Customers/CustomerView'));
const Upgrade = lazy(() => import('./pages/Upgrade'));
const CheckoutPro = lazy(() => import('./pages/CheckoutPro'));

// Admin Pages
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminSubscriptions = lazy(() => import('./pages/Admin/AdminSubscriptions'));
const AdminPayments = lazy(() => import('./pages/Admin/AdminPayments'));

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
          <OnboardingProvider>
            <Toaster position="top-right" />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/termos" element={<TermsOfUse />} />
                <Route path="/privacidade" element={<PrivacyPolicy />} />
                <Route path="/c/:slug" element={<PublicCatalog />} />

                <Route element={<PrivateRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/produtos" element={<ProductList />} />
                    <Route path="/produtos/novo" element={<ProductForm />} />
                    <Route path="/produtos/:id" element={<ProductForm />} />
                    <Route path="/movimentacoes" element={<Movements />} />
                    <Route path="/movimentacoes/nova" element={<MovementForm />} />
                    <Route path="/categorias" element={<Categories />} />
                    <Route path="/catalogo" element={<CatalogSettings />} />
                    <Route path="/conta" element={<Account />} />

                    <Route path="/clientes" element={<CustomersList />} />
                    <Route path="/clientes/novo" element={<CustomerFormPage />} />
                    <Route path="/clientes/:id" element={<CustomerView />} />
                    <Route path="/clientes/:id/editar" element={<CustomerFormPage />} />

                    <Route path="/upgrade" element={<Upgrade />} />
                    <Route path="/checkout/pro" element={<CheckoutPro />} />
                  </Route>
                </Route>

                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="usuarios" element={<AdminUsers />} />
                    <Route path="assinaturas" element={<AdminSubscriptions />} />
                    <Route path="pagamentos" element={<AdminPayments />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </OnboardingProvider>
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

