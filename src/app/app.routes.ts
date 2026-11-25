import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Jonex Hospital — Aba | 24/7 Medical, Surgical & Diagnostic Care',
    loadComponent: () => import('./pages/home').then((m) => m.HomePage),
  },
  {
    path: 'doctors',
    title: 'Find a Doctor & Book a Session | Jonex Hospital Aba',
    loadComponent: () => import('./pages/doctors').then((m) => m.DoctorsPage),
  },
  {
    path: 'appointments',
    title: 'Book an Appointment | Jonex Hospital Aba',
    loadComponent: () => import('./pages/appointments').then((m) => m.AppointmentsPage),
  },
  {
    path: 'services',
    title: 'Clinical Services & Facility Infrastructure | Jonex Hospital Aba',
    loadComponent: () => import('./pages/services').then((m) => m.ServicesPage),
  },
  {
    path: 'patients-and-visitors',
    title: 'Patients, Visitors & Campus Directions | Jonex Hospital Aba',
    loadComponent: () => import('./pages/patients-visitors').then((m) => m.PatientsVisitorsPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
