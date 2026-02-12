import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PlanProvider } from './hooks/usePlan';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import Movements from './pages/Movements';
import MovementForm from './pages/Movements/MovementForm';
import CustomersList from './pages/Customers/CustomersList';
import CustomerFormPage from './pages/Customers/CustomerFormPage';
import CustomerView from './pages/Customers/CustomerView';
import Upgrade from './pages/Upgrade';
import RequirePro from './components/RequirePro';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlanProvider>
          <Toaster position="top-right" />
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
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
