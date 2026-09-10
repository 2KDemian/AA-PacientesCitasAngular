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

import { Medico } from '../../models/medico.model';
import { MedicoSoapService } from '../../services/medico-soap.service';

@Component({
  selector: 'app-medicos',
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
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.css'
})
export class MedicosComponent implements OnInit, AfterViewInit {

  @ViewChild('formularioMedico') formularioMedico!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  medico: Medico = this.crearMedicoVacio();
  editar = false;
  idEditar: number | null = null;
  guardando = false;

  dataSource = new MatTableDataSource<Medico>([]);

  mostrarColumnas: string[] = [
    'idMedico', 'cedula', 'nombre', 'apellido', 'cargo', 'especialidad', 'acciones'
  ];

  constructor(
    private medicoService: MedicoSoapService,
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
    this.medicoService.obtenerMedicos().subscribe({
      next: data => {
        this.dataSource.data = [...data];
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Error al obtener médicos (SOAP):', error);
        Swal.fire('Error', 'No se pudo conectar con el servicio SOAP de Médicos', 'error');
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
      this.medicoService.actualizarMedico(this.medico).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El médico fue actualizado correctamente', 'success');
          this.limpiarFormulario(form);
          this.findAll();
        },
        error: error => this.manejarErrorGuardado(error),
        complete: () => { this.guardando = false; this.cdr.markForCheck(); }
      });
    } else {
      this.medicoService.agregarMedico(this.medico).subscribe({
        next: () => {
          Swal.fire('Guardado', 'El médico fue registrado correctamente', 'success');
          this.limpiarFormulario(form);
          this.findAll();
        },
        error: error => this.manejarErrorGuardado(error),
        complete: () => { this.guardando = false; this.cdr.markForCheck(); }
      });
    }
  }

  editarMedico(medico: Medico): void {
    this.medico = { ...medico };
    this.idEditar = medico.idMedico;
    this.editar = true;

    setTimeout(() => {
      this.formularioMedico.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  cancelarEdicion(form: NgForm): void {
    this.limpiarFormulario(form);
  }

  eliminar(medico: Medico): void {
    Swal.fire({
      title: '¿Desea eliminar el médico?',
      text: `${medico.nombre} ${medico.apellido} - esta acción no se puede deshacer`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(result => {
      if (result.isConfirmed) {
        this.medicoService.eliminarMedico(medico.idMedico).subscribe({
          next: eliminado => {
            if (eliminado) {
              this.findAll();
              Swal.fire('Eliminado', 'El médico ha sido eliminado', 'success');
            } else {
              Swal.fire('No se pudo eliminar', 'El médico tiene citas registradas o no existe', 'error');
            }
            this.cdr.markForCheck();
          },
          error: error => {
            console.error('Error al eliminar médico:', error);
            Swal.fire('Error', 'No se pudo eliminar el médico', 'error');
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
    console.error('Error al guardar médico (SOAP):', error);
    Swal.fire('Error', 'No se pudo guardar el médico', 'error');
  }

  private limpiarFormulario(form: NgForm): void {
    this.medico = this.crearMedicoVacio();
    this.idEditar = null;
    this.editar = false;
    form.resetForm(this.crearMedicoVacio());
  }

  private crearMedicoVacio(): Medico {
    return {
      idMedico: 0,
      cedula: '',
      nombre: '',
      apellido: '',
      cargo: '',
      especialidad: ''
    };
  }
}
