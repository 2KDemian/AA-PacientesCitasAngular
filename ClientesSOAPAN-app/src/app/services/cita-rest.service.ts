import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Cita } from '../models/cita.model';
import { CITA_REST_URL } from '../config/api-config';

// Consume el servicio REST CitaController (JSON puro, sin SOAP).
@Injectable({
  providedIn: 'root'
})
export class CitaRestService {

  constructor(private http: HttpClient) { }

  obtenerCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(CITA_REST_URL);
  }

  obtenerCita(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${CITA_REST_URL}/${id}`);
  }

  obtenerCitasPorPaciente(idPaciente: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${CITA_REST_URL}/paciente/${idPaciente}`);
  }

  obtenerCitasPorMedico(idMedico: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${CITA_REST_URL}/medico/${idMedico}`);
  }

  agregarCita(cita: Partial<Cita>): Observable<Cita> {
    return this.http.post<Cita>(CITA_REST_URL, cita);
  }

  actualizarCita(id: number, cita: Partial<Cita>): Observable<void> {
    return this.http.put<void>(`${CITA_REST_URL}/${id}`, cita);
  }

  eliminarCita(id: number): Observable<void> {
    return this.http.delete<void>(`${CITA_REST_URL}/${id}`);
  }
}
