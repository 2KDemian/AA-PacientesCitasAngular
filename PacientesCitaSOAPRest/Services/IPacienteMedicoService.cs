using CoreWCF;
using PacientesCitaSOAPRest.Models;

namespace PacientesCitaSOAPRest.Services
{
    // Contrato SOAP: gestiona Paciente y Medico (tal como pide la AA
    // para Tercero A Nocturno). La entidad Cita se maneja por REST.
    [ServiceContract]
    public interface IPacienteMedicoService
    {
        // ---------- Pacientes ----------
        [OperationContract]
        List<Paciente> ObtenerPacientes();

        [OperationContract]
        Paciente? ObtenerPaciente(int id);

        [OperationContract]
        Paciente AgregarPaciente(Paciente paciente);

        [OperationContract]
        Paciente? ActualizarPaciente(Paciente paciente);

        [OperationContract]
        bool EliminarPaciente(int id);

        // ---------- Medicos ----------
        [OperationContract]
        List<Medico> ObtenerMedicos();

        [OperationContract]
        Medico? ObtenerMedico(int id);

        [OperationContract]
        Medico AgregarMedico(Medico medico);

        [OperationContract]
        Medico? ActualizarMedico(Medico medico);

        [OperationContract]
        bool EliminarMedico(int id);

        [OperationContract]
        List<Medico> ObtenerMedicosPorEspecialidad(string especialidad);
    }
}
