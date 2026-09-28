import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Loading } from './components/ui/Loading';

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Vehicle = lazy(() => import('./pages/Vehicle').then(module => ({ default: module.Vehicle })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Simulation = lazy(() => import('./pages/Simulation').then(module => ({ default: module.Simulation })));
const Map = lazy(() => import('./pages/Map').then(module => ({ default: module.Map })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={
            <Suspense fallback={<Loading message="Loading Dashboard..." />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="/vehicle" element={
            <Suspense fallback={<Loading message="Loading Vehicle Data..." />}>
              <Vehicle />
            </Suspense>
          } />
          <Route path="/analytics" element={
            <Suspense fallback={<Loading message="Loading Analytics..." />}>
              <Analytics />
            </Suspense>
          } />
          <Route path="/simulation" element={
            <Suspense fallback={<Loading message="Initializing Simulation..." />}>
              <Simulation />
            </Suspense>
          } />
          <Route path="/map" element={
            <Suspense fallback={<Loading message="Loading Maps..." />}>
              <Map />
            </Suspense>
          } />
          <Route path="/settings" element={
            <Suspense fallback={<Loading message="Loading Settings..." />}>
              <Settings />
            </Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
