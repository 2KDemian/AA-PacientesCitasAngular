# Actividad Autónoma - Programación Web I
### Tercero A Nocturno · Integración SOAP + REST + Angular + API externa

## 1. Datos generales

- **Estudiante:** Mateo
- **Paralelo:** Tercero A Nocturno
- **Tema asignado:** Paciente + Médico (SOAP) · Cita (REST)
- **API externa:** Open-Meteo (clima), consumida desde Angular como información complementaria en el flujo de citas

## 2. Entidades y relación

- **Paciente**: IdPaciente, Cedula, Nombre, Apellido, Telefono, Estado.
- **Medico**: IdMedico, Cedula, Nombre, Apellido, Cargo, Especialidad.
- **Cita**: IdCita, Fecha, Hora, Motivo, Tratamiento, Estado, IdPaciente, IdMedico.
  Una Cita relaciona exactamente un Paciente y un Medico (1 paciente → N citas, 1 médico → N citas).

## 3. Tecnologías

- .NET 10 + CoreWCF (BasicHttpBinding) para el servicio **SOAP**
- ASP.NET Core Web API para el servicio **REST**
- Entity Framework Core + SQL Server (una sola base de datos compartida)
- Angular 22 (standalone components) + Angular Material + Bootstrap 5 + SweetAlert2
- API externa pública: [Open-Meteo](https://open-meteo.com/) (geocodificación + clima actual). No requiere API key.

## 4. Estructura

```
PacientesCitaSOAPRest/        Backend .NET (SOAP: Paciente+Medico, REST: Cita)
  Controllers/CitaController.cs
  Services/IPacienteMedicoService.cs
  Services/PacienteMedicoService.cs
  Models/Paciente.cs, Medico.cs, Cita.cs
  Data/PacientesCitaDbContext.cs
  SQL/Script_BD_PacientesCitaSOAPRest.sql
  postman/PacientesCitaSOAPRest.postman_collection.json

ClientesSOAPAN-app/           Frontend Angular
  src/app/models/             Interfaces TypeScript (Paciente, Medico, Cita, ClimaActual)
  src/app/services/           paciente-soap.service.ts, medico-soap.service.ts,
                               cita-rest.service.ts, clima.service.ts
  src/app/components/         inicio, pacientes, medicos, citas, navbar
  src/app/config/api-config.ts  URLs base de los servicios propios
```

> **Nota sobre el reparto SOAP/REST:** originalmente el proyecto tenía SOAP
> gestionando Paciente+Cita y REST gestionando Médico. Se reestructuró para
> que coincida exactamente con lo pedido en la AA: **SOAP = Paciente + Médico**,
> **REST = Cita**. Si tenías otra copia del backend con el reparto anterior,
> usa esta versión.

## 5. Base de datos

1. Abre SQL Server Management Studio (o la herramienta que uses).
2. Ejecuta `PacientesCitaSOAPRest/SQL/Script_BD_PacientesCitaSOAPRest.sql`.
   Esto crea la base `PacientesCitaSOAPRestDB`, las tablas `Paciente`,
   `Medico`, `Cita` (con sus llaves foráneas) y datos de prueba.
3. Verifica que la cadena de conexión en
   `PacientesCitaSOAPRest/appsettings.json` (clave `PacientesCitaConnection`)
   apunte a tu instancia de SQL Server.

## 6. Ejecutar el backend (SOAP + REST en un solo proyecto)

1. Abre `PacientesCitaSOAPRest.slnx` en Visual Studio 2022 (.NET 10).
2. Presiona F5 o Ctrl+F5.
3. El backend queda disponible en `http://localhost:5080`:
   - SOAP: `http://localhost:5080/PacienteMedicoService.svc`
     (WSDL en `http://localhost:5080/PacienteMedicoService.svc?wsdl`)
   - REST: `http://localhost:5080/api/Cita`
4. CORS ya está habilitado para `http://localhost:4200` (Angular).

### Endpoints / operaciones principales

**SOAP — IPacienteMedicoService** (`/PacienteMedicoService.svc`)

| Operación | Descripción |
|---|---|
| `ObtenerPacientes` / `ObtenerPaciente(id)` | Listar / consultar pacientes |
| `AgregarPaciente` / `ActualizarPaciente` / `EliminarPaciente` | CRUD de pacientes |
| `ObtenerMedicos` / `ObtenerMedico(id)` | Listar / consultar médicos |
| `AgregarMedico` / `ActualizarMedico` / `EliminarMedico` | CRUD de médicos |
| `ObtenerMedicosPorEspecialidad(especialidad)` | Búsqueda por especialidad |

**REST — CitaController** (`/api/Cita`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/Cita` | Lista todas las citas (incluye datos de Paciente y Medico) |
| GET | `/api/Cita/{id}` | Cita por id |
| GET | `/api/Cita/paciente/{id}` | Citas de un paciente |
| GET | `/api/Cita/medico/{id}` | Citas de un médico |
| POST | `/api/Cita` | Registrar cita |
| PUT | `/api/Cita/{id}` | Actualizar cita |
| DELETE | `/api/Cita/{id}` | Eliminar cita |

## 7. Ejecutar el frontend Angular

```bash
cd ClientesSOAPAN-app
npm install       # si no lo has hecho
ng serve
```

Abre `http://localhost:4200`. Pantallas disponibles:

- **Inicio** – resumen general (totales de pacientes/médicos/citas).
- **Pacientes** (`/pacientes`) – CRUD completo contra el servicio **SOAP**.
- **Médicos** (`/medicos`) – CRUD completo contra el servicio **SOAP**.
- **Citas** (`/citas`) – CRUD completo contra el servicio **REST**, con
  selección de paciente y médico, y el bloque de **clima (API externa)**.

Si tu backend corre en otro puerto distinto a 5080, cambia
`BASE_URL` en `src/app/config/api-config.ts`.

## 8. API externa: clima (Open-Meteo)

- Se consume desde `src/app/services/clima.service.ts`, dentro de la
  pantalla **Citas** (`/citas`).
- Flujo: el usuario escribe una ciudad (por defecto "Quito") → se geocodifica
  con `geocoding-api.open-meteo.com` → se consulta el clima actual con
  `api.open-meteo.com/v1/forecast` → se muestra temperatura, viento,
  condición y una recomendación relacionada con asistir a la cita
  (por ejemplo, salir con anticipación si hay lluvia).
- No requiere API key, por lo que no hay ninguna clave que proteger.
- Maneja el caso de éxito (tarjeta con el clima) y el caso de error
  (ciudad no encontrada / servicio no disponible → mensaje de error visible).

## 9. Pruebas (Postman)

Importa `PacientesCitaSOAPRest/postman/PacientesCitaSOAPRest.postman_collection.json`.
Incluye:
- Carpeta **SOAP - Paciente y Medico**: todas las operaciones CRUD con el
  sobre XML (SOAPAction) ya armado.
- Carpeta **REST - Cita**: todas las operaciones CRUD en JSON.

## 10. Pendiente para la entrega (no generado por este asistente)

- [ ] Repositorio de GitHub con esta estructura y el enlace compartido.
- [ ] Video de máximo 5 minutos demostrando Angular, SOAP, REST, API externa
      y evidencia en base de datos.
- [ ] Revisar la fecha de entrega con el docente: el PDF indica
      **miércoles 09/09/2026**, que ya pasó a la fecha de hoy — confírmalo
      antes de entregar.
