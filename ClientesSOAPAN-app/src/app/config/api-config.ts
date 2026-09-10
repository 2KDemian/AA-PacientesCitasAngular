// URLs de los servicios propios (backend PacientesCitaSOAPRest).
// Si tu backend corre en otro puerto, solo cambia BASE_URL aquí.
export const BASE_URL = 'http://localhost:5080';

// Servicio SOAP: Paciente + Medico
export const SOAP_URL = `${BASE_URL}/PacienteMedicoService.svc`;
export const SOAP_NAMESPACE = 'http://tempuri.org/IPacienteMedicoService';

// Servicio REST: Cita
export const CITA_REST_URL = `${BASE_URL}/api/Cita`;
