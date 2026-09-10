import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import Swal from 'sweetalert2';

import { Paciente } from '../../models/paciente.model';
import { PacienteSoapService } from '../../services/paciente-soap.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent implements OnInit, AfterViewInit {

  @ViewChild('formularioPaciente') formularioPaciente!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  paciente: Paciente = this.crearPacienteVacio();
  editar = false;
  idEditar: number | null = null;
  guardando = false;

  dataSource = new MatTableDataSource<Paciente>([]);

  mostrarColumnas: string[] = [
    'idPaciente', 'cedula', 'nombre', 'apellido', 'telefono', 'estado', 'acciones'
  ];

  constructor(
    private pacienteService: PacienteSoapService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.findAll();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  findAll(): void {
    this.pacienteService.obtenerPacientes().subscribe({
      next: data => {
        this.dataSource.data = [...data];
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Error al obtener pacientes (SOAP):', error);
        Swal.fire('Error', 'No se pudo conectar con el servicio SOAP de Pacientes', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  guardar(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.guardando = true;

    if (this.editar && this.idEditar !== null) {
      this.pacienteService.actualizarPaciente(this.paciente).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El paciente fue actualizado correctamente', 'success');
          this.limpiarFormulario(form);
          this.findAll();
        },
        error: error => this.manejarErrorGuardado(error),
        complete: () => { this.guardando = false; this.cdr.markForCheck(); }
      });
    } else {
      this.pacienteService.agregarPaciente(this.paciente).subscribe({
        next: () => {
          Swal.fire('Guardado', 'El paciente fue registrado correctamente', 'success');
          this.limpiarFormulario(form);
          this.findAll();
        },
        error: error => this.manejarErrorGuardado(error),
        complete: () => { this.guardando = false; this.cdr.markForCheck(); }
      });
    }
  }

  editarPaciente(paciente: Paciente): void {
    this.paciente = { ...paciente };
    this.idEditar = paciente.idPaciente;
    this.editar = true;

    setTimeout(() => {
      this.formularioPaciente.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  cancelarEdicion(form: NgForm): void {
    this.limpiarFormulario(form);
  }

  eliminar(paciente: Paciente): void {
    Swal.fire({
      title: '¿Desea eliminar el paciente?',
      text: `${paciente.nombre} ${paciente.apellido} - esta acción no se puede deshacer`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(result => {
      if (result.isConfirmed) {
        this.pacienteService.eliminarPaciente(paciente.idPaciente).subscribe({
          next: eliminado => {
            if (eliminado) {
              this.findAll();
              Swal.fire('Eliminado', 'El paciente ha sido eliminado', 'success');
            } else {
              Swal.fire('No se pudo eliminar', 'El paciente tiene citas registradas o no existe', 'error');
            }
            this.cdr.markForCheck();
          },
          error: error => {
            console.error('Error al eliminar paciente:', error);
            Swal.fire('Error', 'No se pudo eliminar el paciente', 'error');
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

  private manejarErrorGuardado(error: unknown): void {
    console.error('Error al guardar paciente (SOAP):', error);
    Swal.fire('Error', 'No se pudo guardar el paciente', 'error');
  }

  private limpiarFormulario(form: NgForm): void {
    this.paciente = this.crearPacienteVacio();
    this.idEditar = null;
    this.editar = false;
    form.resetForm(this.crearPacienteVacio());
  }

  private crearPacienteVacio(): Paciente {
    return {
      idPaciente: 0,
      cedula: '',
      nombre: '',
      apellido: '',
      telefono: '',
      estado: true
    };
  }
}
