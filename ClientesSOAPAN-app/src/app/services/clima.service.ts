import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, switchMap, throwError, timeout } from 'rxjs';

import { ClimaActual } from '../models/clima.model';

// API externa pública (Open-Meteo): no requiere API key, por lo que no
// hay ninguna clave que proteger ni exponer en el repositorio.
// 1) Geocodificación: nombre de ciudad -> latitud/longitud
// 2) Pronóstico: clima actual para esas coordenadas
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const DESCRIPCIONES_CLIMA: Record<number, string> = {
  0: 'Cielo despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada intensa',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos violentos',
  95: 'Tormenta eléctrica',
  96: 'Tormenta con granizo'
};

interface GeocodingResultado {
  results?: { name: string; latitude: number; longitude: number }[];
}

interface ForecastResultado {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClimaService {

  constructor(private http: HttpClient) { }

  // Tiempo máximo de espera por llamada: si Open-Meteo no responde, se
  // muestra un error en vez de dejar el spinner cargando para siempre.
  private readonly TIMEOUT_MS = 8000;

  obtenerClimaPorCiudad(ciudad: string): Observable<ClimaActual> {
    const url = `${GEOCODING_URL}?name=${encodeURIComponent(ciudad)}&count=1&language=es&format=json`;

    return this.http.get<GeocodingResultado>(url).pipe(
      timeout(this.TIMEOUT_MS),
      switchMap(geo => {
        const encontrada = geo.results?.[0];

        if (!encontrada) {
          return throwError(() => new Error(`No se encontró la ciudad "${ciudad}"`));
        }

        const forecastUrl =
          `${FORECAST_URL}?latitude=${encontrada.latitude}&longitude=${encontrada.longitude}&current_weather=true`;

        return this.http.get<ForecastResultado>(forecastUrl).pipe(
          timeout(this.TIMEOUT_MS),
          map(forecast => this.mapearClima(encontrada.name, forecast))
        );
      }),
      catchError(error => {
        if (error?.name === 'TimeoutError') {
          return throwError(() => new Error(
            'El servicio de clima no respondió a tiempo (revisa tu conexión a internet o vuelve a intentarlo).'
          ));
        }
        return throwError(() => error);
      })
    );
  }

  private mapearClima(ciudad: string, data: ForecastResultado): ClimaActual {
    const actual = data.current_weather;
    const descripcion = DESCRIPCIONES_CLIMA[actual.weathercode] ?? 'Condición no disponible';

    return {
      ciudad,
      temperatura: actual.temperature,
      velocidadViento: actual.windspeed,
      codigoClima: actual.weathercode,
      descripcion,
      hora: actual.time,
      recomendacion: this.recomendacionParaCita(actual.weathercode, actual.temperature)
    };
  }

  // Relaciona el clima con el flujo de citas médicas, tal como pide la AA.
  private recomendacionParaCita(codigo: number, temperatura: number): string {
    if ([61, 63, 65, 80, 81, 82, 95, 96].includes(codigo)) {
      return 'Se esperan lluvias: sal con anticipación hacia tu cita médica.';
    }
    if ([45, 48].includes(codigo)) {
      return 'Hay niebla: conduce con precaución si vas camino a tu cita.';
    }
    if (temperatura <= 10) {
      return 'Temperatura baja: abrígate antes de acudir a tu cita.';
    }
    if (temperatura >= 27) {
      return 'Temperatura alta: hidrátate antes de acudir a tu cita.';
    }
    return 'Buenas condiciones para acudir a tu cita sin contratiempos.';
  }
}
