using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace PacientesCitaSOAPRest.Models
{
    // Mismo fix que Paciente.cs: namespace y Order fijos para que coincidan
    // con el XML que arma Angular (si no, las propiedades llegan en null).
    [DataContract(Namespace = "http://tempuri.org/")]
    public class Medico
    {
        [Key]
        [DataMember(Order = 0)]
        public int IdMedico { get; set; }

        [DataMember(Order = 1)]
        public string Cedula { get; set; } = string.Empty;

        [DataMember(Order = 2)]
        public string Nombre { get; set; } = string.Empty;

        [DataMember(Order = 3)]
        public string Apellido { get; set; } = string.Empty;

        [DataMember(Order = 4)]
        public string? Cargo { get; set; }

        [DataMember(Order = 5)]
        public string? Especialidad { get; set; }
    }
}
