import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to auth state', () => {
      spyOn(apiService, 'getAuthState').and.returnValue(of({ isLoggedIn: true, username: 'test' }));
      component.ngOnInit();
      expect(component.isLoggedIn).toBeTrue();
      expect(component.username).toBe('test');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from auth state', () => {
      spyOn(apiService, 'getAuthState').and.returnValue(of({ isLoggedIn: true, username: 'test' }));
      component.ngOnInit();
      const unsubscribeSpy = jasmine.createSpy('unsubscribe');
      (component as any).authSubscription = { unsubscribe: unsubscribeSpy };
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call logout and navigate to /login', async () => {
      spyOn(apiService, 'logout').and.returnValue(of({}));
      const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');

      await component.logout();
      expect(apiService.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should handle error and navigate to /login', async () => {
      spyOn(apiService, 'logout').and.returnValue(throwError(() => new Error('Logout service unavailable')));
      const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');

      await component.logout();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      console.log('Logout error:', new Error('Logout service unavailable'));
    });
  });
});
