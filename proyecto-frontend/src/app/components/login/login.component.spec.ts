import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('login', () => {
    it('should navigate to /subjects on successful login', async () => {
      const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
      spyOn(apiService, 'login').and.returnValue(of({ ok: true, token: 'test-token' }));

      component.loginForm = { username: 'test', password: 'pass' };
      await component.login();
      expect(apiService.login).toHaveBeenCalledWith({ username: 'test', password: 'pass' });
      expect(navigateSpy).toHaveBeenCalledWith(['/subjects']);
      expect(component.errorMessage).toBe('');
      console.log('Login response:', { ok: true, token: 'test-token' });
    });

    it('should show error message on invalid input', async () => {
      spyOn(window, 'setTimeout');
      component.loginForm = { username: '', password: '' };
      await component.login();
      expect(component.errorMessage).toBe('Por favor, complete todos los campos.');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });

    it('should handle API error', async () => {
      spyOn(apiService, 'login').and.returnValue(throwError(() => new Error('Authentication service unavailable')));
      spyOn(window, 'setTimeout');

      component.loginForm = { username: 'test', password: 'pass' };
      await component.login();
      expect(component.errorMessage).toBe('Authentication service unavailable');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
      console.log('Login error:', new Error('Authentication service unavailable'));
    });

    it('should handle unsuccessful response', async () => {
      spyOn(apiService, 'login').and.returnValue(of({ ok: false, msg: 'Invalid credentials' }));
      spyOn(window, 'setTimeout');

      component.loginForm = { username: 'test', password: 'pass' };
      await component.login();
      expect(component.errorMessage).toBe('Invalid credentials');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
      console.log('Login response:', { ok: false, msg: 'Invalid credentials' });
    });
  });
});
