using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace PacientesCitaSOAPRest.Models
{
    // Tabla manejada por el servicio SOAP.
    // [DataContract(Namespace = "http://tempuri.org/")] fuerza a que las
    // propiedades de esta clase se serialicen/deserialicen bajo el mismo
    // namespace "tempuri.org" que usa la operación SOAP (y que ya usa
    // Angular al armar el XML con el prefijo "tem:"). Sin esto, WCF/CoreWCF
    // usa por defecto un namespace de contrato de datos autogenerado
    // distinto, y las propiedades llegaban vacías aunque el nodo raíz sí
    // se reconociera (por eso se creaba el registro, pero en blanco).
    //
    // [DataMember(Order = N)] es igual de importante: DataContractSerializer
    // lee los elementos hijos EN SECUENCIA, esperando el orden del contrato
    // (alfabético si no se especifica Order). Angular arma el XML en el
    // orden natural del formulario (Cedula, Nombre, Apellido, Telefono,
    // Estado), que no coincide con el alfabético (Apellido, Cedula, Estado,
    // IdPaciente, Nombre, Telefono). Cuando el orden no coincide, el
    // deserializador descarta como "ausente" cualquier propiedad que no
    // encaje en la posición esperada, sin lanzar error — por eso Apellido
    // llegaba NULL. Fijar Order explícito para que coincida con el orden
    // que ya envía Angular soluciona esto sin tocar nada del lado Angular.
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
