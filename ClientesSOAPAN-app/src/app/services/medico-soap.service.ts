import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Medico } from '../models/medico.model';
import { SOAP_URL, SOAP_NAMESPACE } from '../config/api-config';

// Consume el servicio SOAP IPacienteMedicoService (operaciones de Medico).
@Injectable({
  providedIn: 'root'
})
export class MedicoSoapService {

  constructor(private http: HttpClient) { }

  obtenerMedicos(): Observable<Medico[]> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:ObtenerMedicos/>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('ObtenerMedicos'),
      responseType: 'text'
    }).pipe(
      map(response => this.convertirXMLAMedicos(response))
    );
  }

  obtenerMedico(id: number): Observable<Medico | null> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:ObtenerMedico>
      <tem:id>${id}</tem:id>
    </tem:ObtenerMedico>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('ObtenerMedico'),
      responseType: 'text'
    }).pipe(
      map(response => this.convertirXMLAMedico(response))
    );
  }

  agregarMedico(medico: Medico): Observable<Medico | null> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:AgregarMedico>
      <tem:medico>
        <tem:Cedula>${this.escaparXml(medico.cedula)}</tem:Cedula>
        <tem:Nombre>${this.escaparXml(medico.nombre)}</tem:Nombre>
        <tem:Apellido>${this.escaparXml(medico.apellido)}</tem:Apellido>
        <tem:Cargo>${this.escaparXml(medico.cargo)}</tem:Cargo>
        <tem:Especialidad>${this.escaparXml(medico.especialidad)}</tem:Especialidad>
      </tem:medico>
    </tem:AgregarMedico>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('AgregarMedico'),
      responseType: 'text'
    }).pipe(
      map(response => this.convertirXMLAMedico(response))
    );
  }

  actualizarMedico(medico: Medico): Observable<Medico | null> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:ActualizarMedico>
      <tem:medico>
        <tem:IdMedico>${medico.idMedico}</tem:IdMedico>
        <tem:Cedula>${this.escaparXml(medico.cedula)}</tem:Cedula>
        <tem:Nombre>${this.escaparXml(medico.nombre)}</tem:Nombre>
        <tem:Apellido>${this.escaparXml(medico.apellido)}</tem:Apellido>
        <tem:Cargo>${this.escaparXml(medico.cargo)}</tem:Cargo>
        <tem:Especialidad>${this.escaparXml(medico.especialidad)}</tem:Especialidad>
      </tem:medico>
    </tem:ActualizarMedico>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('ActualizarMedico'),
      responseType: 'text'
    }).pipe(
      map(response => this.convertirXMLAMedico(response))
    );
  }

  eliminarMedico(id: number): Observable<boolean> {
    const soapRequest = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:EliminarMedico>
      <tem:id>${id}</tem:id>
    </tem:EliminarMedico>
  </soap:Body>
</soap:Envelope>`;

    return this.http.post(SOAP_URL, soapRequest, {
      headers: this.crearHeaders('EliminarMedico'),
      responseType: 'text'
    }).pipe(
      map(response => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(response, 'text/xml');

        const resultado =
          xml.getElementsByTagNameNS('*', 'EliminarMedicoResult')[0];

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

  private convertirXMLAMedicos(xml: string): Medico[] {
    const parser = new DOMParser();
    const documento = parser.parseFromString(xml, 'text/xml');
    const nodos = documento.getElementsByTagNameNS('*', 'Medico');

    const medicos: Medico[] = [];
    for (let i = 0; i < nodos.length; i++) {
      medicos.push(this.convertirNodoAMedico(nodos[i]));
    }
    return medicos;
  }

  private convertirXMLAMedico(xml: string): Medico | null {
    const parser = new DOMParser();
    const documento = parser.parseFromString(xml, 'text/xml');
    const nodos = documento.getElementsByTagNameNS('*', 'Medico');

    if (nodos.length === 0) {
      return null;
    }
    return this.convertirNodoAMedico(nodos[0]);
  }

  private convertirNodoAMedico(nodo: Element): Medico {
    const valor = (nombre: string): string => {
      return nodo.getElementsByTagNameNS('*', nombre)[0]?.textContent ?? '';
    };

    return {
      idMedico: Number(valor('IdMedico')),
      cedula: valor('Cedula'),
      nombre: valor('Nombre'),
      apellido: valor('Apellido'),
      cargo: valor('Cargo'),
      especialidad: valor('Especialidad')
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
