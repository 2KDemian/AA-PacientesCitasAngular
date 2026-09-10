using CoreWCF;
using Microsoft.EntityFrameworkCore;
using PacientesCitaSOAPRest.Data;
using PacientesCitaSOAPRest.Models;

namespace PacientesCitaSOAPRest.Services
{
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class PacienteMedicoService : IPacienteMedicoService
    {
        private readonly PacientesCitaDbContext _context;

        public PacienteMedicoService(PacientesCitaDbContext context)
        {
            _context = context;
        }

        // ---------- Pacientes ----------

        public List<Paciente> ObtenerPacientes()
        {
            return _context.Pacientes.OrderBy(p => p.IdPaciente).ToList();
        }

        public Paciente? ObtenerPaciente(int id)
        {
            return _context.Pacientes.FirstOrDefault(p => p.IdPaciente == id);
        }

        public Paciente AgregarPaciente(Paciente paciente)
        {
            _context.Pacientes.Add(paciente);
            _context.SaveChanges();
            return paciente;
        }

        public Paciente? ActualizarPaciente(Paciente paciente)
        {
            var pacienteExistente = _context.Pacientes.Find(paciente.IdPaciente);

            if (pacienteExistente == null) return null;

            pacienteExistente.Cedula = paciente.Cedula;
            pacienteExistente.Nombre = paciente.Nombre;
            pacienteExistente.Apellido = paciente.Apellido;
            pacienteExistente.Telefono = paciente.Telefono;
            pacienteExistente.Estado = paciente.Estado;

            _context.SaveChanges();

            return pacienteExistente;
        }

        public bool EliminarPaciente(int id)
        {
            var paciente = _context.Pacientes.Find(id);
            if (paciente == null) return false;

            var tieneCitas = _context.Citas.Any(c => c.IdPaciente == id);
            if (tieneCitas) return false;

            _context.Pacientes.Remove(paciente);
            _context.SaveChanges();
            return true;
        }

        // ---------- Medicos ----------

        public List<Medico> ObtenerMedicos()
        {
            return _context.Medicos.OrderBy(m => m.IdMedico).ToList();
        }

        public Medico? ObtenerMedico(int id)
        {
            return _context.Medicos.FirstOrDefault(m => m.IdMedico == id);
        }

        public Medico AgregarMedico(Medico medico)
        {
            _context.Medicos.Add(medico);
            _context.SaveChanges();
            return medico;
        }

        public Medico? ActualizarMedico(Medico medico)
        {
            var medicoExistente = _context.Medicos.Find(medico.IdMedico);

            if (medicoExistente == null) return null;

            medicoExistente.Cedula = medico.Cedula;
            medicoExistente.Nombre = medico.Nombre;
            medicoExistente.Apellido = medico.Apellido;
            medicoExistente.Cargo = medico.Cargo;
            medicoExistente.Especialidad = medico.Especialidad;

            _context.SaveChanges();

            return medicoExistente;
        }

        public bool EliminarMedico(int id)
        {
            var medico = _context.Medicos.Find(id);
            if (medico == null) return false;

            var tieneCitas = _context.Citas.Any(c => c.IdMedico == id);
            if (tieneCitas) return false;

            _context.Medicos.Remove(medico);
            _context.SaveChanges();
            return true;
        }

        public List<Medico> ObtenerMedicosPorEspecialidad(string especialidad)
        {
            return _context.Medicos
                .Where(m => m.Especialidad != null && m.Especialidad.Contains(especialidad))
                .ToList();
        }
    }
}
