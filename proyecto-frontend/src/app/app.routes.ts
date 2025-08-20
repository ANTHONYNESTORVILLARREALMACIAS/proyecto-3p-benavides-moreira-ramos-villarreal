import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SubjectsComponent } from './components/subjects/subjects.component';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { ResourcesComponent } from './components/resources/resources.component';
import { EvaluationsComponent } from './components/evaluations/evaluations.component';
import { inject } from '@angular/core';
import { ApiService } from './services/api.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'subjects',
    component: SubjectsComponent,
    canActivate: [
      () => inject(ApiService).checkLoggedIn().pipe(
        map(res => res.ok || false),
        catchError(() => of(false))
      )
    ]
  },
  {
    path: 'subscriptions',
    component: SubscriptionsComponent,
    canActivate: [
      () => inject(ApiService).checkLoggedIn().pipe(
        map(res => res.ok || false),
        catchError(() => of(false))
      )
    ]
  },
  {
    path: 'resources/:idVariante',
    component: ResourcesComponent,
    canActivate: [
      () => inject(ApiService).checkLoggedIn().pipe(
        map(res => res.ok || false),
        catchError(() => of(false))
      )
    ]
  },
  {
    path: 'evaluations/:idRecurso',
    component: EvaluationsComponent,
    canActivate: [
      () => inject(ApiService).checkLoggedIn().pipe(
        map(res => res.ok || false),
        catchError(() => of(false))
      )
    ]
  }
];
