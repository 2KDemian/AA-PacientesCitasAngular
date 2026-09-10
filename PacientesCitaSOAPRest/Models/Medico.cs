using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace PacientesCitaSOAPRest.Models
{
    // Tabla manejada por el servicio SOAP (junto con Paciente).
    // Mismo fix que en Paciente.cs: se fija el namespace del contrato de
    // datos a "http://tempuri.org/" para que coincida con lo que Angular
    // ya envía (prefijo "tem:"), evitando que las propiedades lleguen
    // vacías al servidor. También se fija [DataMember(Order = N)] en el
    // mismo orden en que Angular arma el XML (Cedula, Nombre, Apellido,
    // Cargo, Especialidad), porque DataContractSerializer lee los
    // elementos en secuencia y por defecto usa orden alfabético — si no
    // coincide, descarta silenciosamente como "ausente" lo que no encaje.
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
