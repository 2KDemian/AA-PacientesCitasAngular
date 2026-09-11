using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace PacientesCitaSOAPRest.Models
{
    // Namespace y Order fijos para que coincidan con el XML que arma Angular
    // (mismo namespace "tempuri.org" y mismo orden de campos que el formulario).
    // Si no coinciden, WCF deserializa el objeto pero deja las propiedades en null.
    [DataContract(Namespace = "http://tempuri.org/")]
    public class Paciente
    {
        [Key]
        [DataMember(Order = 0)]
        public int IdPaciente { get; set; }

        [DataMember(Order = 1)]
        public string Cedula { get; set; } = string.Empty;

        [DataMember(Order = 2)]
        public string Nombre { get; set; } = string.Empty;

        [DataMember(Order = 3)]
        public string Apellido { get; set; } = string.Empty;

        [DataMember(Order = 4)]
        public string? Telefono { get; set; }

        [DataMember(Order = 5)]
        public bool Estado { get; set; }
    }
}
