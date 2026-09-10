using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PacientesCitaSOAPRest.Data;
using PacientesCitaSOAPRest.Models;

namespace PacientesCitaSOAPRest.Controllers
{
    // Servicio REST: gestiona Cita y la relaciona con Paciente y Medico
    // (ambos manejados por el servicio SOAP IPacienteMedicoService).
    [Route("api/[controller]")]
    [ApiController]
    public class CitaController : ControllerBase
    {
        private readonly PacientesCitaDbContext _context;

        public CitaController(PacientesCitaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cita>>> ObtenerCitas()
        {
            var citas = await _context.Citas
                .AsNoTracking()
                .Include(c => c.Paciente)
                .Include(c => c.Medico)
                .OrderBy(c => c.IdCita)
                .ToListAsync();

            return Ok(citas);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Cita>> ObtenerCita(int id)
        {
            var cita = await _context.Citas
                .AsNoTracking()
                .Include(c => c.Paciente)
                .Include(c => c.Medico)
                .FirstOrDefaultAsync(c => c.IdCita == id);

            if (cita == null)
                return NotFound(new { mensaje = "No se encontró la cita" });

            return Ok(cita);
        }

        [HttpGet("paciente/{idPaciente:int}")]
        public async Task<ActionResult<IEnumerable<Cita>>> ObtenerCitasPorPaciente(int idPaciente)
        {
            var citas = await _context.Citas
                .AsNoTracking()
                .Include(c => c.Paciente)
                .Include(c => c.Medico)
                .Where(c => c.IdPaciente == idPaciente)
                .OrderBy(c => c.Fecha)
                .ToListAsync();

            return Ok(citas);
        }

        [HttpGet("medico/{idMedico:int}")]
        public async Task<ActionResult<IEnumerable<Cita>>> ObtenerCitasPorMedico(int idMedico)
        {
            var citas = await _context.Citas
                .AsNoTracking()
                .Include(c => c.Paciente)
                .Include(c => c.Medico)
                .Where(c => c.IdMedico == idMedico)
                .OrderBy(c => c.Fecha)
                .ToListAsync();

            return Ok(citas);
        }

        [HttpPost]
        public async Task<ActionResult<Cita>> AgregarCita(Cita cita)
        {
            var pacienteExiste = await _context.Pacientes.AnyAsync(p => p.IdPaciente == cita.IdPaciente);
            if (!pacienteExiste)
                return BadRequest(new { mensaje = "El paciente indicado no existe" });

            var medicoExiste = await _context.Medicos.AnyAsync(m => m.IdMedico == cita.IdMedico);
            if (!medicoExiste)
                return BadRequest(new { mensaje = "El médico indicado no existe" });

            cita.Paciente = null;
            cita.Medico = null;

            await _context.Citas.AddAsync(cita);
            await _context.SaveChangesAsync();

            await _context.Entry(cita).Reference(c => c.Paciente).LoadAsync();
            await _context.Entry(cita).Reference(c => c.Medico).LoadAsync();

            return Ok(cita);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActualizarCita(int id, Cita cita)
        {
            var citaExistente = await _context.Citas.FindAsync(id);

            if (citaExistente == null)
                return NotFound(new { mensaje = "Cita no encontrada" });

            var pacienteExiste = await _context.Pacientes.AnyAsync(p => p.IdPaciente == cita.IdPaciente);
            if (!pacienteExiste)
                return BadRequest(new { mensaje = "El paciente indicado no existe" });

            var medicoExiste = await _context.Medicos.AnyAsync(m => m.IdMedico == cita.IdMedico);
            if (!medicoExiste)
                return BadRequest(new { mensaje = "El médico indicado no existe" });

            citaExistente.Fecha = cita.Fecha;
            citaExistente.Hora = cita.Hora;
            citaExistente.Motivo = cita.Motivo;
            citaExistente.Tratamiento = cita.Tratamiento;
            citaExistente.Estado = cita.Estado;
            citaExistente.IdPaciente = cita.IdPaciente;
            citaExistente.IdMedico = cita.IdMedico;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarCita(int id)
        {
            var cita = await _context.Citas.FindAsync(id);

            if (cita == null)
                return NotFound(new { mensaje = "Cita no encontrada" });

            _context.Citas.Remove(cita);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
