import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent, AsyncVariantsPipe, FilterByVariantPipe, FilterByResourcePipe, HasSubscriptionPipe, GetUserRolePipe } from './main.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';
import { Subject } from '../../models/subject.model';
import { UserVariant } from '../../models/user-variant.model';
import { Resource } from '../../models/resource.model';
import { Evaluation } from '../../models/evaluation.model';
import { Variant } from '../../models/variant.model';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent, HttpClientTestingModule, FormsModule],
      providers: [ApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
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

    it('should handle error in variant fetch', async () => {
      spyOn(apiService, 'getVariantsBySubject').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error');

      const result = await component.buildVariantInfoMap([{ idAsignatura: 1, nombre: 'Math' }]);
      expect(result).toEqual({});
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('toggleSubState', () => {
    it('should update subscription state and reload data', async () => {
      spyOn(apiService, 'updateSubscriptionState').and.returnValue(of({}));
      spyOn(component, 'loadData');
      spyOn(component, 'loadResources');

      component.selectedVariantId = 1;
      await component.toggleSubState(1, 'inactiva');
      expect(apiService.updateSubscriptionState).toHaveBeenCalledWith(1, 'inactiva');
      expect(component.loadData).toHaveBeenCalled();
      expect(component.loadResources).toHaveBeenCalledWith(1);
    });

    it('should handle error', async () => {
      spyOn(apiService, 'updateSubscriptionState').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.toggleSubState(1, 'inactiva');
      expect(component.errorMessage).toBe('Error actualizando suscripción: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });
  });

  describe('subscribe', () => {
    it('should create subscription and reload data', async () => {
      spyOn(apiService, 'createUserVariant').and.returnValue(of({}));
      spyOn(apiService, 'createSubscription').and.returnValue(of({}));
      spyOn(component, 'loadData');
      spyOn(component, 'loadResources');

      component.subscribeForm = { idVariante: 1, rol: 'suscriptor' };
      component.selectedVariantId = 1;
      await component.subscribe(1);
      expect(apiService.createUserVariant).toHaveBeenCalledWith({ idVariante: 1, rol: 'suscriptor' });
      expect(apiService.createSubscription).toHaveBeenCalledWith(1);
      expect(component.loadData).toHaveBeenCalled();
      expect(component.loadResources).toHaveBeenCalledWith(1);
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

  describe('deleteResource', () => {
    it('should delete resource and reload resources', async () => {
      spyOn(apiService, 'deleteResource').and.returnValue(of({}));
      spyOn(component, 'loadResources');

      component.selectedVariantId = 1;
      await component.deleteResource(1);
      expect(apiService.deleteResource).toHaveBeenCalledWith(1);
      expect(component.loadResources).toHaveBeenCalledWith(1);
    });

    it('should handle error', async () => {
      spyOn(apiService, 'deleteResource').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.deleteResource(1);
      expect(component.errorMessage).toBe('Error eliminando recurso: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });
  });

  describe('openUploadOverlay', () => {
    it('should open upload overlay', () => {
      component.openUploadOverlay(1);
      expect(component.uploadForm.idVariante).toBe(1);
      expect(component.showUploadOverlay).toBeTrue();
    });
  });

  describe('closeUploadOverlay', () => {
    it('should close upload overlay', () => {
      component.closeUploadOverlay();
      expect(component.showUploadOverlay).toBeFalse();
      expect(component.uploadForm).toEqual({ idVariante: 0, titulo: '', descripcion: '', tipo: 'material', file: null });
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

  describe('onFileChange', () => {
    it('should set file in uploadForm', () => {
      const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const event = { target: { files: [mockFile] } } as any;
      component.onFileChange(event);
      expect(component.uploadForm.file).toBe(mockFile);
    });
  });
});

// Pruebas para los pipes
describe('AsyncVariantsPipe', () => {
  let pipe: AsyncVariantsPipe;
  let apiService: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    apiService = TestBed.inject(ApiService);
    pipe = new AsyncVariantsPipe(apiService);
  });

  it('should transform idAsignatura to variants observable', () => {
    const mockVariants: Variant[] = [{ idVariante: 1, idAsignatura: 1, nombre: 'Variant 1' }];
    spyOn(apiService, 'getVariantsBySubject').and.returnValue(of(mockVariants));

    const result = pipe.transform(1);
    result.subscribe(variants => expect(variants).toEqual(mockVariants));
  });
});

describe('FilterByVariantPipe', () => {
  let pipe: FilterByVariantPipe;

  beforeEach(() => {
    pipe = new FilterByVariantPipe();
  });

  it('should filter resources by idVariante', () => {
    const mockResources: Resource[] = [
      { idRecurso: 1, idVariante: 1, tipo: 'material', titulo: 'Test', descripcion: '', file_path: '', creado_por: 1 },
      { idRecurso: 2, idVariante: 2, tipo: 'material', titulo: 'Test2', descripcion: '', file_path: '', creado_por: 1 }
    ];
    const result = pipe.transform(mockResources, 1);
    expect(result).toEqual([mockResources[0]]);
  });
});

describe('FilterByResourcePipe', () => {
  let pipe: FilterByResourcePipe;

  beforeEach(() => {
    pipe = new FilterByResourcePipe();
  });

  it('should filter evaluations by idRecurso', () => {
    const mockEvaluations: Evaluation[] = [
      { idEvaluacion: 1, idRecurso: 1, fecha_inicio: '2025-08-01', fecha_fin: '2025-08-02', instrucciones: 'Test' },
      { idEvaluacion: 2, idRecurso: 2, fecha_inicio: '2025-08-01', fecha_fin: '2025-08-02', instrucciones: 'Test2' }
    ];
    const result = pipe.transform(mockEvaluations, 1);
    expect(result).toEqual([mockEvaluations[0]]);
  });
});

describe('HasSubscriptionPipe', () => {
  let pipe: HasSubscriptionPipe;

  beforeEach(() => {
    pipe = new HasSubscriptionPipe();
  });

  it('should return true if subscription exists', () => {
    const mockSubscriptions: UserVariant[] = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
    const result = pipe.transform(mockSubscriptions, 1);
    expect(result).toBeTrue();
  });

  it('should return false if no subscription exists', () => {
    const mockSubscriptions: UserVariant[] = [{ idUsuario: 1, idVariante: 2, rol: 'admin' }];
    const result = pipe.transform(mockSubscriptions, 1);
    expect(result).toBeFalse();
  });
});

describe('GetUserRolePipe', () => {
  let pipe: GetUserRolePipe;

  beforeEach(() => {
    pipe = new GetUserRolePipe();
  });

  it('should return role if subscription exists', () => {
    const mockSubscriptions: UserVariant[] = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
    const result = pipe.transform(mockSubscriptions, 1);
    expect(result).toBe('admin');
  });

  it('should return "none" if no subscription exists', () => {
    const mockSubscriptions: UserVariant[] = [{ idUsuario: 1, idVariante: 2, rol: 'admin' }];
    const result = pipe.transform(mockSubscriptions, 1);
    expect(result).toBe('none');
  });
});
