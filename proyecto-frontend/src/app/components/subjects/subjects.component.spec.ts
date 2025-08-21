import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectsComponent } from './subjects.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';
import { Subject } from '../../models/subject.model';
import { UserVariant } from '../../models/user-variant.model';

describe('SubjectsComponent', () => {
  let component: SubjectsComponent;
  let fixture: ComponentFixture<SubjectsComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectsComponent, HttpClientTestingModule, RouterTestingModule, FormsModule],
      providers: [ApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectsComponent);
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
    it('should load subscriptions and subjects', async () => {
      const mockSubscriptions: UserVariant[] = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
      const mockSubjects: Subject[] = [{ idAsignatura: 1, nombre: 'Math' }];
      const mockVariants = [{ idVariante: 1, idAsignatura: 1, nombre: 'Variant 1' }];
      spyOn(apiService, 'getUserSubscriptions').and.returnValue(of(mockSubscriptions));
      spyOn(apiService, 'getAllSubjects').and.returnValue(of(mockSubjects));
      spyOn(apiService, 'getVariantsBySubject').and.returnValue(of(mockVariants));

      await component.loadData();
      expect(component.subscriptions).toEqual(mockSubscriptions);
      expect(component.subjects).toEqual(mockSubjects);
      expect(component.variantInfo[1]).toEqual({ nombre_asignatura: 'Math', nombre_variante: 'Variant 1' });
    });

    it('should handle error', async () => {
      spyOn(apiService, 'getUserSubscriptions').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.loadData();
      expect(component.errorMessage).toBe('Error cargando datos: API Error');
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

  describe('subscribe', () => {
    it('should create subscription and reload data', async () => {
      spyOn(apiService, 'createUserVariant').and.returnValue(of({}));
      spyOn(apiService, 'createSubscription').and.returnValue(of({}));
      spyOn(component, 'loadData');

      component.subscribeForm = { idVariante: 1, rol: 'suscriptor' };
      await component.subscribe(1);
      expect(apiService.createUserVariant).toHaveBeenCalledWith({ idVariante: 1, rol: 'suscriptor' });
      expect(apiService.createSubscription).toHaveBeenCalledWith(1);
      expect(component.loadData).toHaveBeenCalled();
      expect(component.showSubscribeOverlay).toBeFalse();
    });

    it('should handle error', async () => {
      spyOn(apiService, 'createUserVariant').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.subscribe(1);
      expect(component.errorMessage).toBe('Error creando suscripción: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });
  });

  describe('modifyRole', () => {
    it('should update role and reload data', async () => {
      spyOn(apiService, 'updateUserVariantRole').and.returnValue(of({}));
      spyOn(component, 'loadData');

      component.subscribeForm = { idVariante: 1, rol: 'admin' };
      await component.modifyRole(1);
      expect(apiService.updateUserVariantRole).toHaveBeenCalledWith({ idVariante: 1, rol: 'admin' });
      expect(component.loadData).toHaveBeenCalled();
      expect(component.showModifyRoleOverlay).toBeFalse();
    });

    it('should handle error', async () => {
      spyOn(apiService, 'updateUserVariantRole').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.modifyRole(1);
      expect(component.errorMessage).toBe('Error modificando rol: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });
  });

  describe('openSubscribeOverlay', () => {
    it('should open subscribe overlay', () => {
      component.openSubscribeOverlay(1);
      expect(component.subscribeForm).toEqual({ idVariante: 1, rol: 'suscriptor' });
      expect(component.showSubscribeOverlay).toBeTrue();
    });
  });

  describe('closeSubscribeOverlay', () => {
    it('should close subscribe overlay', () => {
      component.closeSubscribeOverlay();
      expect(component.showSubscribeOverlay).toBeFalse();
      expect(component.subscribeForm).toEqual({ idVariante: 0, rol: 'suscriptor' });
    });
  });

  describe('openModifyRoleOverlay', () => {
    it('should open modify role overlay', () => {
      component.openModifyRoleOverlay(1, 'admin');
      expect(component.subscribeForm).toEqual({ idVariante: 1, rol: 'admin' });
      expect(component.showModifyRoleOverlay).toBeTrue();
    });
  });

  describe('closeModifyRoleOverlay', () => {
    it('should close modify role overlay', () => {
      component.closeModifyRoleOverlay();
      expect(component.showModifyRoleOverlay).toBeFalse();
      expect(component.subscribeForm).toEqual({ idVariante: 0, rol: 'suscriptor' });
    });
  });

  describe('hasSubscription', () => {
    it('should return true if subscription exists', () => {
      component.subscriptions = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
      expect(component.hasSubscription(1)).toBeTrue();
    });

    it('should return false if no subscription exists', () => {
      component.subscriptions = [];
      expect(component.hasSubscription(1)).toBeFalse();
    });
  });

  describe('getUserRole', () => {
    it('should return user role', () => {
      component.subscriptions = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
      expect(component.getUserRole(1)).toBe('admin');
    });

    it('should return "none" if no subscription', () => {
      component.subscriptions = [];
      expect(component.getUserRole(1)).toBe('none');
    });
  });
});
