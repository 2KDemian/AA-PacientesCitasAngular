using System.ComponentModel.DataAnnotations;

namespace PacientesCitaSOAPRest.Models
{
    // Tabla manejada por el servicio REST; relaciona Paciente (SOAP) y Medico (SOAP)
    public class Cita
    {
        [Key]
        public int IdCita { get; set; }

        public DateTime Fecha { get; set; }

        public DateTime Hora { get; set; }

        public string Motivo { get; set; } = string.Empty;

        public string? Tratamiento { get; set; }

        public bool Estado { get; set; }

        public int IdPaciente { get; set; }

        // Se llena con Include() en el REST controller para mostrar
        // en Angular los datos del paciente sin otra consulta aparte
        public Paciente? Paciente { get; set; }

        public int IdMedico { get; set; }

        public Medico? Medico { get; set; }
    }
}
