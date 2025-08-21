import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscriptionsComponent } from './subscriptions.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';
import { UserVariant } from '../../models/user-variant.model';
import { Subject } from '../../models/subject.model';

describe('SubscriptionsComponent', () => {
  let component: SubscriptionsComponent;
  let fixture: ComponentFixture<SubscriptionsComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionsComponent, HttpClientTestingModule],
      providers: [ApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadData on init', () => {
      spyOn(component, 'loadData');
      component.ngOnInit();
      expect(component.loadData).toHaveBeenCalled();
    });
  });

  describe('loadData', () => {
    it('should load subscriptions and variant info', async () => {
      const mockSubscriptions: UserVariant[] = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
      const mockSubjects: Subject[] = [{ idAsignatura: 1, nombre: 'Math' }];
      const mockVariants = [{ idVariante: 1, idAsignatura: 1, nombre: 'Variant 1' }];
      spyOn(apiService, 'getUserSubscriptions').and.returnValue(of(mockSubscriptions));
      spyOn(apiService, 'getAllSubjects').and.returnValue(of(mockSubjects));
      spyOn(apiService, 'getVariantsBySubject').and.returnValue(of(mockVariants));

      await component.loadData();
      expect(component.subscriptions).toEqual(mockSubscriptions);
      expect(component.variantInfo[1]).toEqual({ nombre_asignatura: 'Math', nombre_variante: 'Variant 1' });
    });

    it('should handle error', async () => {
      spyOn(apiService, 'getUserSubscriptions').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.loadData();
      expect(component.errorMessage).toBe('Error cargando suscripciones: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });
  });

  describe('buildVariantInfoMap', () => {
    it('should build variant info map', async () => {
      const mockSubjects: Subject[] = [{ idAsignatura: 1, nombre: 'Math' }];
      const mockVariants = [{ idVariante: 1, idAsignatura: 1, nombre: 'Variant 1' }];
      spyOn(apiService, 'getVariantsBySubject').and.returnValue(of(mockVariants));

      const result = await component.buildVariantInfoMap(mockSubjects);
      expect(result[1]).toEqual({ nombre_asignatura: 'Math', nombre_variante: 'Variant 1' });
    });

    it('should handle error', async () => {
      spyOn(apiService, 'getVariantsBySubject').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error');

      const result = await component.buildVariantInfoMap([{ idAsignatura: 1, nombre: 'Math' }]);
      expect(result).toEqual({});
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('toggleSubState', () => {
    it('should update subscription state and reload data', async () => {
      component.subscriptions = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
      spyOn(apiService, 'updateSubscriptionState').and.returnValue(of({}));
      spyOn(component, 'loadData');

      await component.toggleSubState(1, 'inactiva');
      expect(apiService.updateSubscriptionState).toHaveBeenCalledWith(1, 'inactiva');
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should handle error', async () => {
      component.subscriptions = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
      spyOn(apiService, 'updateSubscriptionState').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.toggleSubState(1, 'inactiva');
      expect(component.errorMessage).toBe('Error actualizando suscripción: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });

    it('should do nothing if subscription not found', async () => {
      component.subscriptions = [];
      spyOn(apiService, 'updateSubscriptionState');
      spyOn(component, 'loadData');

      await component.toggleSubState(1, 'inactiva');
      expect(apiService.updateSubscriptionState).not.toHaveBeenCalled();
      expect(component.loadData).toHaveBeenCalled();
    });
  });
});
