import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Paciente } from '../models/paciente.model';
import { SOAP_URL, SOAP_NAMESPACE } from '../config/api-config';

// Consume el servicio SOAP IPacienteMedicoService (operaciones de Paciente).
// Angular no tiene un cliente SOAP nativo: se arma el sobre XML a mano
// con HttpClient y se parsea la respuesta con DOMParser, igual que en
// el ejemplo de ClienteSoapService visto en clase.
@Injectable({
  providedIn: 'root'
})
export class PacienteSoapService {

  constructor(private http: HttpClient) { }

  obtenerPacientes(): Observable<Paciente[]> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:ObtenerPacientes/>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('ObtenerPacientes'),
      responseType: 'text'
    }).pipe(
      map(response => this.convertirXMLAPacientes(response))
    );
  }

  obtenerPaciente(id: number): Observable<Paciente | null> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:ObtenerPaciente>
      <tem:id>${id}</tem:id>
    </tem:ObtenerPaciente>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('ObtenerPaciente'),
      responseType: 'text'
    }).pipe(
      map(response => this.convertirXMLAPaciente(response))
    );
  }

  agregarPaciente(paciente: Paciente): Observable<Paciente | null> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:AgregarPaciente>
      <tem:paciente>
        <tem:Cedula>${this.escaparXml(paciente.cedula)}</tem:Cedula>
        <tem:Nombre>${this.escaparXml(paciente.nombre)}</tem:Nombre>
        <tem:Apellido>${this.escaparXml(paciente.apellido)}</tem:Apellido>
        <tem:Telefono>${this.escaparXml(paciente.telefono)}</tem:Telefono>
        <tem:Estado>${paciente.estado}</tem:Estado>
      </tem:paciente>
    </tem:AgregarPaciente>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('AgregarPaciente'),
      responseType: 'text'
    }).pipe(
      map(response => this.convertirXMLAPaciente(response))
    );
  }

  actualizarPaciente(paciente: Paciente): Observable<Paciente | null> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:ActualizarPaciente>
      <tem:paciente>
        <tem:IdPaciente>${paciente.idPaciente}</tem:IdPaciente>
        <tem:Cedula>${this.escaparXml(paciente.cedula)}</tem:Cedula>
        <tem:Nombre>${this.escaparXml(paciente.nombre)}</tem:Nombre>
        <tem:Apellido>${this.escaparXml(paciente.apellido)}</tem:Apellido>
        <tem:Telefono>${this.escaparXml(paciente.telefono)}</tem:Telefono>
        <tem:Estado>${paciente.estado}</tem:Estado>
      </tem:paciente>
    </tem:ActualizarPaciente>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('ActualizarPaciente'),
      responseType: 'text'
    }).pipe(
      map(response => this.convertirXMLAPaciente(response))
    );
  }

  eliminarPaciente(id: number): Observable<boolean> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:EliminarPaciente>
      <tem:id>${id}</tem:id>
    </tem:EliminarPaciente>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('EliminarPaciente'),
      responseType: 'text'
    }).pipe(
      map(response => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(response, 'text/xml');

        const resultado =
          xml.getElementsByTagNameNS('*', 'EliminarPacienteResult')[0];

        return resultado?.textContent === 'true';
      })
    );
  }

  private crearHeaders(operacion: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `"${SOAP_NAMESPACE}/${operacion}"`
    });
  }

  private convertirXMLAPacientes(xml: string): Paciente[] {
    const parser = new DOMParser();
    const documento = parser.parseFromString(xml, 'text/xml');
    const nodos = documento.getElementsByTagNameNS('*', 'Paciente');

    const pacientes: Paciente[] = [];
    for (let i = 0; i < nodos.length; i++) {
      pacientes.push(this.convertirNodoAPaciente(nodos[i]));
    }
    return pacientes;
  }

  private convertirXMLAPaciente(xml: string): Paciente | null {
    const parser = new DOMParser();
    const documento = parser.parseFromString(xml, 'text/xml');
    const nodos = documento.getElementsByTagNameNS('*', 'Paciente');

    if (nodos.length === 0) {
      return null;
    }
    return this.convertirNodoAPaciente(nodos[0]);
  }

  private convertirNodoAPaciente(nodo: Element): Paciente {
    const valor = (nombre: string): string => {
      return nodo.getElementsByTagNameNS('*', nombre)[0]?.textContent ?? '';
    };

    return {
      idPaciente: Number(valor('IdPaciente')),
      cedula: valor('Cedula'),
      nombre: valor('Nombre'),
      apellido: valor('Apellido'),
      telefono: valor('Telefono'),
      estado: valor('Estado') === 'true'
    };
  }

  private escaparXml(valor: string): string {
    return (valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
