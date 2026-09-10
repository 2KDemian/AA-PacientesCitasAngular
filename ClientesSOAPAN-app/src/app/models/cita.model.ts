import { Paciente } from './paciente.model';
import { Medico } from './medico.model';

export interface Cita {
  idCita: number;
  fecha: string;   // yyyy-MM-dd
  hora: string;     // ISO datetime (yyyy-MM-ddTHH:mm:ss)
  motivo: string;
  tratamiento: string | null;
  estado: boolean;
  idPaciente: number;
  idMedico: number;

  // Enviados por el REST de Cita con Include(), listos para mostrar
  // sin hacer otra consulta desde Angular.
  paciente?: Paciente | null;
  medico?: Medico | null;
}
