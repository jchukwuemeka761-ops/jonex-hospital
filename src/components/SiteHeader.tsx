import {Calendar, Menu, X} from 'lucide-react';
import {useState} from 'react';
import {Link, NavLink} from 'react-router-dom';

function desktopNavLinkClass({isActive}: {isActive: boolean}): string {
  return `hover:text-[#0F2942] hover:underline hover:underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-1 ${
    isActive
      ? 'text-[#0F2942] underline underline-offset-8 decoration-2 decoration-teal-700'
      : ''
  }`;
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="font-display text-xl font-bold tracking-tight text-[#0F2942] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        >
          Jonex Hospital
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <NavLink to="/services" className={desktopNavLinkClass}>
            Services &amp; Infrastructure
          </NavLink>
          <NavLink to="/doctors" className={desktopNavLinkClass}>
            Find a Doctor
          </NavLink>
          <NavLink to="/appointments" className={desktopNavLinkClass}>
            Appointments
          </NavLink>
          <Link
            to="/#about"
            className="hover:text-[#0F2942] hover:underline hover:underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            About
          </Link>
          <NavLink to="/patients-and-visitors" className={desktopNavLinkClass}>
            Patients &amp; Visitors
          </NavLink>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/appointments"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <Calendar className="w-[18px] h-[18px]" aria-hidden="true" />
            <span>Book Appointment</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label="Toggle navigation menu"
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2"
        >
          <Link
            to="/services"
            onClick={closeMenu}
            className="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Services &amp; Infrastructure
          </Link>
          <Link
            to="/doctors"
            onClick={closeMenu}
            className="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Find a Doctor
          </Link>
          <Link
            to="/appointments"
            onClick={closeMenu}
            className="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Appointments
          </Link>
          <Link
            to="/#about"
            onClick={closeMenu}
            className="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            About &amp; Directors
          </Link>
          <Link
            to="/patients-and-visitors"
            onClick={closeMenu}
            className="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Patients &amp; Visitors
          </Link>
          <div className="pt-2">
            <Link
              to="/appointments"
              onClick={closeMenu}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#0F2942] rounded-lg"
            >
              <Calendar className="w-[18px] h-[18px]" aria-hidden="true" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
