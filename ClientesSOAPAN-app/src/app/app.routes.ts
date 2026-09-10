import { Routes } from '@angular/router';

import { InicioComponent } from './components/inicio/inicio.component';
import { PacientesComponent } from './components/pacientes/pacientes.component';
import { MedicosComponent } from './components/medicos/medicos.component';
import { CitasComponent } from './components/citas/citas.component';

export const routes: Routes = [
  { path: '', component: InicioComponent, title: 'Inicio' },
  { path: 'pacientes', component: PacientesComponent, title: 'Pacientes (SOAP)' },
  { path: 'medicos', component: MedicosComponent, title: 'Médicos (SOAP)' },
  { path: 'citas', component: CitasComponent, title: 'Citas (REST)' },
  { path: '**', redirectTo: '' }
];
