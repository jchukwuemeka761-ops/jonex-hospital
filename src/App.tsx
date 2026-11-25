import {AlertTriangle, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {HospitalAssistant} from './components/HospitalAssistant.tsx';
import {SiteFooter} from './components/SiteFooter.tsx';
import {SiteHeader} from './components/SiteHeader.tsx';
import {AppointmentsPage} from './pages/AppointmentsPage.tsx';
import {DoctorsPage} from './pages/DoctorsPage.tsx';
import {HomePage} from './pages/HomePage.tsx';
import {PatientsVisitorsPage} from './pages/PatientsVisitorsPage.tsx';
import {ServicesPage} from './pages/ServicesPage.tsx';

function ScrollAndHashManager() {
  const {pathname, hash} = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.slice(1);
      const timer = window.setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({behavior: 'smooth'});
        }
      }, 60);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({top: 0, behavior: 'auto'});
    return undefined;
  }, [pathname, hash]);

  return null;
}

function RoutedAppointments() {
  const {search} = useLocation();
  return <AppointmentsPage key={search} />;
}

export function App() {
  const [mapsQuotaWarning, setMapsQuotaWarning] = useState(false);

  useEffect(() => {
    const win = window as unknown as Record<string, unknown>;
    const previousAuthFailure = win['gm_authFailure'] as (() => void) | undefined;

    win['gm_authFailure'] = () => {
      setMapsQuotaWarning(true);
      previousAuthFailure?.();
    };

    const handleQuotaEvent = () => setMapsQuotaWarning(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaEvent);

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason ?? '');
      if (
        reason.includes('OverQuotaMapError') ||
        reason.includes('RESOURCE_EXHAUSTED') ||
        reason.includes('OVER_QUERY_LIMIT')
      ) {
        setMapsQuotaWarning(true);
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaEvent);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      win['gm_authFailure'] = previousAuthFailure;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <ScrollAndHashManager />

      {mapsQuotaWarning && (
        <div
          role="alert"
          className="bg-amber-50 border-b border-amber-300 px-4 py-3 text-xs sm:text-sm text-amber-900 relative z-50"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-[18px] h-[18px] text-amber-700 shrink-0" aria-hidden="true" />
              <span>
                The embedded map quota limit has been reached. You can still use the direct Google
                Maps GPS directions link or call +234 807 801 6691.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMapsQuotaWarning(false)}
              aria-label="Dismiss map notice"
              className="text-amber-800 hover:text-amber-950 shrink-0"
            >
              <X className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <SiteHeader />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/appointments" element={<RoutedAppointments />} />
          <Route path="/patients-and-visitors" element={<PatientsVisitorsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <HospitalAssistant />
      <SiteFooter />
    </div>
  );
}
