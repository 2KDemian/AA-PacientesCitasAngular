import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import Swal from 'sweetalert2';

import { Cita } from '../../models/cita.model';
import { Paciente } from '../../models/paciente.model';
import { Medico } from '../../models/medico.model';
import { ClimaActual } from '../../models/clima.model';

import { CitaRestService } from '../../services/cita-rest.service';
import { PacienteSoapService } from '../../services/paciente-soap.service';
import { MedicoSoapService } from '../../services/medico-soap.service';
import { ClimaService } from '../../services/clima.service';

interface CitaFormulario {
  idCita: number;
  fechaInput: string;   // yyyy-MM-dd (input type="date")
  horaInput: string;    // HH:mm (input type="time")
  motivo: string;
  tratamiento: string;
  estado: boolean;
  idPaciente: number | null;
  idMedico: number | null;
}

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.css'
})
export class CitasComponent implements OnInit, AfterViewInit {

  @ViewChild('formularioCita') formularioCita!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  cita: CitaFormulario = this.crearCitaVacia();
  editar = false;
  guardando = false;

  pacientes: Paciente[] = [];
  medicos: Medico[] = [];

  dataSource = new MatTableDataSource<Cita>([]);

  mostrarColumnas: string[] = [
    'idCita', 'fecha', 'hora', 'paciente', 'medico', 'motivo', 'estado', 'acciones'
  ];

  // ---------- API externa: clima ----------
  ciudadClima = 'Quito';
  clima: ClimaActual | null = null;
  consultandoClima = false;
  errorClima: string | null = null;

  constructor(
    private citaService: CitaRestService,
    private pacienteService: PacienteSoapService,
    private medicoService: MedicoSoapService,
    private climaService: ClimaService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatosBase();
    this.consultarClima();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarDatosBase(): void {
    forkJoin({
      pacientes: this.pacienteService.obtenerPacientes(),
      medicos: this.medicoService.obtenerMedicos(),
      citas: this.citaService.obtenerCitas()
    }).subscribe({
      next: ({ pacientes, medicos, citas }) => {
        // Se descartan registros sin nombre (datos de prueba incompletos)
        // para que no aparezcan como opción seleccionable en los combos.
        this.pacientes = pacientes.filter(p => !!p.nombre?.trim() && !!p.apellido?.trim());
        this.medicos = medicos.filter(m => !!m.nombre?.trim() && !!m.apellido?.trim());
        this.dataSource.data = [...citas];
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Error al cargar pacientes/médicos/citas:', error);
        Swal.fire('Error', 'No se pudieron cargar los datos base (SOAP/REST)', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  findAllCitas(): void {
    this.citaService.obtenerCitas().subscribe({
      next: data => {
        this.dataSource.data = [...data];
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Error al obtener citas (REST):', error);
        Swal.fire('Error', 'No se pudo conectar con el servicio REST de Citas', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  guardar(form: NgForm): void {
    if (form.invalid || this.cita.idPaciente === null || this.cita.idMedico === null) {
      form.control.markAllAsTouched();
      return;
    }

    const payload = {
      fecha: this.cita.fechaInput,
      hora: `${this.cita.fechaInput}T${this.cita.horaInput}:00`,
      motivo: this.cita.motivo,
      tratamiento: this.cita.tratamiento,
      estado: this.cita.estado,
      idPaciente: this.cita.idPaciente,
      idMedico: this.cita.idMedico
    };

    this.guardando = true;

    if (this.editar) {
      this.citaService.actualizarCita(this.cita.idCita, payload).subscribe({
        next: () => {
          Swal.fire('Actualizada', 'La cita fue actualizada correctamente', 'success');
          this.limpiarFormulario(form);
          this.findAllCitas();
        },
        error: error => this.manejarErrorGuardado(error),
        complete: () => { this.guardando = false; this.cdr.markForCheck(); }
      });
    } else {
      this.citaService.agregarCita(payload).subscribe({
        next: () => {
          Swal.fire('Registrada', 'La cita fue registrada correctamente', 'success');
          this.limpiarFormulario(form);
          this.findAllCitas();
        },
        error: error => this.manejarErrorGuardado(error),
        complete: () => { this.guardando = false; this.cdr.markForCheck(); }
      });
    }
  }

  editarCita(cita: Cita): void {
    this.cita = {
      idCita: cita.idCita,
      fechaInput: (cita.fecha ?? '').substring(0, 10),
      horaInput: (cita.hora ?? '').substring(11, 16),
      motivo: cita.motivo,
      tratamiento: cita.tratamiento ?? '',
      estado: cita.estado,
      idPaciente: cita.idPaciente,
      idMedico: cita.idMedico
    };
    this.editar = true;

    setTimeout(() => {
      this.formularioCita.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  cancelarEdicion(form: NgForm): void {
    this.limpiarFormulario(form);
  }

  eliminar(cita: Cita): void {
    Swal.fire({
      title: '¿Desea eliminar la cita?',
      text: `${cita.motivo} - esta acción no se puede deshacer`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(result => {
      if (result.isConfirmed) {
        this.citaService.eliminarCita(cita.idCita).subscribe({
          next: () => {
            this.findAllCitas();
            Swal.fire('Eliminada', 'La cita ha sido eliminada', 'success');
            this.cdr.markForCheck();
          },
          error: error => {
            console.error('Error al eliminar cita:', error);
            Swal.fire('Error', 'No se pudo eliminar la cita', 'error');
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  applyFilter(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtro.trim().toLowerCase();
  }

  nombrePaciente(cita: Cita): string {
    if (cita.paciente) return `${cita.paciente.nombre} ${cita.paciente.apellido}`;
    const p = this.pacientes.find(x => x.idPaciente === cita.idPaciente);
    return p ? `${p.nombre} ${p.apellido}` : `#${cita.idPaciente}`;
  }

  nombreMedico(cita: Cita): string {
    if (cita.medico) return `${cita.medico.nombre} ${cita.medico.apellido}`;
    const m = this.medicos.find(x => x.idMedico === cita.idMedico);
    return m ? `${m.nombre} ${m.apellido}` : `#${cita.idMedico}`;
  }

  // ---------- API externa: clima ----------
  consultarClima(): void {
    if (!this.ciudadClima.trim()) return;

    this.consultandoClima = true;
    this.errorClima = null;
    this.clima = null;

    this.climaService.obtenerClimaPorCiudad(this.ciudadClima.trim()).subscribe({
      next: clima => {
        this.clima = clima;
        this.consultandoClima = false;
        // Sin esto, en un proyecto Angular con change detection "zoneless"
        // (por defecto en `ng new` recientes) la vista no se refresca sola
        // cuando el dato llega de forma asíncrona: se queda mostrando el
        // spinner aunque el valor ya esté disponible, hasta que otro evento
        // manejado por Angular (como un click) fuerce un nuevo chequeo.
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Error al consultar la API externa de clima:', error);
        this.errorClima = error?.message ?? 'No se pudo consultar el clima en este momento';
        this.consultandoClima = false;
        this.cdr.markForCheck();
      }
    });
  }

  private manejarErrorGuardado(error: unknown): void {
    console.error('Error al guardar cita (REST):', error);
    const mensaje = (error as any)?.error?.mensaje ?? 'No se pudo guardar la cita';
    Swal.fire('Error', mensaje, 'error');
  }

  private limpiarFormulario(form: NgForm): void {
    this.cita = this.crearCitaVacia();
    this.editar = false;
    form.resetForm(this.crearCitaVacia());
  }

  private crearCitaVacia(): CitaFormulario {
    return {
      idCita: 0,
      fechaInput: '',
      horaInput: '',
      motivo: '',
      tratamiento: '',
      estado: true,
      idPaciente: null,
      idMedico: null
    };
  }
}
