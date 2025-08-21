import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('register', () => {
    it('should navigate to /subjects on successful registration', async () => {
      const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
      spyOn(apiService, 'register').and.returnValue(of({ ok: true, token: 'test-token' }));

      component.registerForm = { username: 'test', password: 'pass', email: 'test@example.com', bornDate: '2000-01-01' };
      await component.register();
      expect(apiService.register).toHaveBeenCalledWith({
        username: 'test',
        password: 'pass',
        email: 'test@example.com',
        bornDate: '2000-01-01'
      });
      expect(navigateSpy).toHaveBeenCalledWith(['/subjects']);
      expect(component.errorMessage).toBe('');
      console.log('Register response:', { ok: true, token: 'test-token' });
    });

    it('should handle unsuccessful response', async () => {
      spyOn(apiService, 'register').and.returnValue(of({ ok: false, msg: 'User exists' }));
      spyOn(window, 'setTimeout');

      component.registerForm = { username: 'test', password: 'pass', email: 'test@example.com', bornDate: '2000-01-01' };
      await component.register();
      expect(component.errorMessage).toBe('User exists');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
      console.log('Register response:', { ok: false, msg: 'User exists' });
    });

    it('should handle API error', async () => {
      spyOn(apiService, 'register').and.returnValue(throwError(() => new Error('Registration service unavailable')));
      spyOn(window, 'setTimeout');

      component.registerForm = { username: 'test', password: 'pass', email: 'test@example.com', bornDate: '2000-01-01' };
      await component.register();
      expect(component.errorMessage).toBe('Registration service unavailable');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
      console.log('Register error:', new Error('Registration service unavailable'));
    });
  });
});
