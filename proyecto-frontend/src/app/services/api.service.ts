import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Subject } from '../models/subject.model';
import { Variant } from '../models/variant.model';
import { Resource } from '../models/resource.model';
import { Evaluation } from '../models/evaluation.model';
import { UserVariant } from '../models/user-variant.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private token: string | null = null;
  private authState = new BehaviorSubject<{ isLoggedIn: boolean; username: string | null }>({
    isLoggedIn: !!localStorage.getItem('token'),
    username: null
  });

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.checkLoggedIn().subscribe({
        next: (res) => {
          this.authState.next({ isLoggedIn: res.ok, username: res.username || null });
        },
        error: () => {
          this.authState.next({ isLoggedIn: false, username: null });
        }
      });
    }
  }

  getAuthState(): Observable<{ isLoggedIn: boolean; username: string | null }> {
    return this.authState.asObservable();
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
    this.authState.next({ isLoggedIn: false, username: null });
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return headers;
  }

  private handleError(error: any): Observable<never> {
    const msg = error.error?.msg || error.message || 'Unknown error';
    if (msg === 'invalid-token' || msg === 'not-authenticated') {
      this.clearToken();
    }
    return throwError(() => new Error(msg));
  }

  private buildUrl(endpoint: string): string {
    const clean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.apiUrl}/${clean}`;
  }

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(this.buildUrl('api/auth/login'), data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map((response: any) => {
        if (response.ok && response.token) {
          this.setToken(response.token);
          this.authState.next({ isLoggedIn: true, username: response.username || data.username });
        }
        return response;
      }),
      catchError(err => this.handleError(err))
    );
  }

  register(data: { username: string; password: string; email: string; bornDate: string }): Observable<any> {
    return this.http.post(this.buildUrl('api/auth/register'), data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map((response: any) => {
        if (response.ok && response.token) {
          this.setToken(response.token);
          this.authState.next({ isLoggedIn: true, username: response.username || data.username });
        }
        return response;
      }),
      catchError(err => this.handleError(err))
    );
  }

  logout(): Observable<any> {
    return this.http.post(this.buildUrl('api/auth/logout'), {}, {
      headers: this.getHeaders()
    }).pipe(
      map((response: any) => {
        this.clearToken();
        return response;
      }),
      catchError(err => this.handleError(err))
    );
  }

  checkLoggedIn(): Observable<any> {
    return this.http.get(this.buildUrl('api/auth/check'), {
      headers: this.getHeaders()
    }).pipe(
      map((response: any) => {
        if (response.ok) {
          this.authState.next({ isLoggedIn: true, username: response.username || null });
        }
        return response;
      }),
      catchError(err => this.handleError(err))
    );
  }

  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<{ ok: boolean; data: Subject[] }>(this.buildUrl('api/subjects'), {
      headers: this.getHeaders()
    }).pipe(
      map(res => res.data),
      catchError(err => this.handleError(err))
    );
  }

  getAllVariants(): Observable<Variant[]> {
    return this.http.get<{ ok: boolean; data: Variant[] }>(this.buildUrl('api/variants'), {
      headers: this.getHeaders()
    }).pipe(
      map(res => res.data),
      catchError(err => this.handleError(err))
    );
  }

  getVariantsBySubject(idAsignatura: number): Observable<Variant[]> {
    return this.http.get<{ ok: boolean; data: Variant[] }>(
      this.buildUrl(`api/variants/bySubject?idAsignatura=${idAsignatura}`),
      { headers: this.getHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(err => this.handleError(err))
    );
  }

  getUserSubscriptions(): Observable<UserVariant[]> {
    return this.http.get<{ ok: boolean; data: UserVariant[] }>(this.buildUrl('api/subscriptions/user'), {
      headers: this.getHeaders()
    }).pipe(
      map(res => res.data),
      catchError(err => this.handleError(err))
    );
  }

  createSubscription(idVariante: number): Observable<any> {
    const params = new HttpParams().set('idVariante', idVariante.toString());
    return this.http.post(this.buildUrl('api/subscriptions'), {}, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  updateSubscriptionState(idSuscripcion: number, state: string): Observable<any> {
    const params = new HttpParams().set('idSuscripcion', idSuscripcion.toString());
    return this.http.put(this.buildUrl('api/subscriptions/state'), { state }, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getResourcesByUser(): Observable<Resource[]> {
    return this.http.get<{ ok: boolean; resources: Resource[] }>(this.buildUrl('api/resources/byUser'), {
      headers: this.getHeaders()
    }).pipe(
      map(res => res.resources),
      catchError(err => this.handleError(err))
    );
  }

  getResources(idVariante: number): Observable<Resource[]> {
    const params = new HttpParams().set('idVariante', idVariante.toString());
    return this.http.get<Resource[]>(this.buildUrl('api/resources/byVariant'), {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  createResource(idVariante: number, formData: FormData): Observable<any> {
    const params = new HttpParams().set('idVariante', idVariante.toString());
    return this.http.post(this.buildUrl('api/resources'), formData, {
      headers: new HttpHeaders(),
      params
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  deleteResource(idRecurso: number): Observable<any> {
    const params = new HttpParams().set('idRecurso', idRecurso.toString());
    return this.http.delete(this.buildUrl('api/resources'), {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  downloadResource(idRecurso: number): Observable<Blob> {
    const params = new HttpParams().set('idRecurso', idRecurso.toString());
    return this.http.get(this.buildUrl('api/resources/download'), {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getResourcesByVariant(idVariante: number): Observable<Resource[]> {
    const params = new HttpParams().set('idVariante', idVariante.toString());
    return this.http.get<{ ok: boolean; resources: Resource[] }>(this.buildUrl('api/resources/byVariant'), {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(res => res.resources),
      catchError(err => this.handleError(err))
    );
  }

  createEvaluation(data: { idRecurso: number; fecha_inicio: string; fecha_fin: string; instrucciones: string }): Observable<any> {
    return this.http.post(this.buildUrl('api/evaluations'), data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getEvaluationsByResource(idRecurso: number): Observable<Evaluation[]> {
    const params = new HttpParams().set('idRecurso', idRecurso.toString());
    return this.http.get<{ ok: boolean; data: Evaluation[] }>(this.buildUrl('api/evaluations/byResource'), {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(res => res.data),
      catchError(err => this.handleError(err))
    );
  }

  updateEvaluation(data: { idEvaluacion: number; fecha_inicio: string; fecha_fin: string; instrucciones: string }): Observable<any> {
    return this.http.put(this.buildUrl('api/evaluations'), data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  createUserVariant(data: { idVariante: number; rol: string }): Observable<any> {
    return this.http.post(this.buildUrl('api/userVariants'), data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  updateUserVariantRole(data: { idVariante: number; rol: string }): Observable<any> {
    return this.http.put(this.buildUrl('api/userVariants'), data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }
}
