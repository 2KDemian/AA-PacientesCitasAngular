import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PacienteSoapService } from '../../services/paciente-soap.service';
import { MedicoSoapService } from '../../services/medico-soap.service';
import { CitaRestService } from '../../services/cita-rest.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  totalPacientes = 0;
  totalMedicos = 0;
  totalCitas = 0;
  cargando = true;

  constructor(
    private pacienteService: PacienteSoapService,
    private medicoService: MedicoSoapService,
    private citaService: CitaRestService
  ) { }

  ngOnInit(): void {
    forkJoin({
      pacientes: this.pacienteService.obtenerPacientes(),
      medicos: this.medicoService.obtenerMedicos(),
      citas: this.citaService.obtenerCitas()
    }).subscribe({
      next: ({ pacientes, medicos, citas }) => {
        this.totalPacientes = pacientes.length;
        this.totalMedicos = medicos.length;
        this.totalCitas = citas.length;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al cargar el resumen inicial:', error);
        this.cargando = false;
      }
    });
  }
}
