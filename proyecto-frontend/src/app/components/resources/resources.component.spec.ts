import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourcesComponent } from './resources.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';
import { Resource } from '../../models/resource.model';
import { UserVariant } from '../../models/user-variant.model';
import { Evaluation } from '../../models/evaluation.model';
import { FormsModule } from '@angular/forms';

describe('ResourcesComponent', () => {
  let component: ResourcesComponent;
  let fixture: ComponentFixture<ResourcesComponent>;
  let apiService: ApiService;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('1')
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcesComponent, HttpClientTestingModule, FormsModule],
      providers: [
        ApiService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcesComponent);
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
    it('should load subscriptions, variant name, resources, and evaluations', async () => {
      const mockSubscriptions: UserVariant[] = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
      const mockVariants = [{ idVariante: 1, idAsignatura: 1, nombre: 'Variant 1' }];
      const mockResources: Resource[] = [{ idRecurso: 1, idVariante: 1, tipo: 'material', titulo: 'Test', descripcion: '', file_path: '', creado_por: 1 }];
      const mockEvaluations: Evaluation[] = [{ idEvaluacion: 1, idRecurso: 1, fecha_inicio: '2025-08-01', fecha_fin: '2025-08-02', instrucciones: 'Test' }];
      spyOn(apiService, 'getUserSubscriptions').and.returnValue(of(mockSubscriptions));
      spyOn(apiService, 'getAllVariants').and.returnValue(of(mockVariants));
      spyOn(apiService, 'getResourcesByVariant').and.returnValue(of(mockResources));
      spyOn(apiService, 'getEvaluationsByResource').and.returnValue(of(mockEvaluations));

      await component.loadData();
      expect(component.subscriptions).toEqual(mockSubscriptions);
      expect(component.variantName).toBe('Variant 1');
      expect(component.resources).toEqual(mockResources);
      expect(component.evaluations[1]).toEqual(mockEvaluations);
      expect(component.loadingResources).toBeFalse();
    });

    it('should handle error', async () => {
      spyOn(apiService, 'getUserSubscriptions').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.loadData();
      expect(component.errorMessage).toBe('Error cargando recursos: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
      expect(component.loadingResources).toBeFalse();
    });
  });

  describe('deleteResource', () => {
    it('should delete resource and reload data', async () => {
      spyOn(apiService, 'deleteResource').and.returnValue(of({}));
      spyOn(component, 'loadData');

      await component.deleteResource(1);
      expect(apiService.deleteResource).toHaveBeenCalledWith(1);
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should handle error', async () => {
      spyOn(apiService, 'deleteResource').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.deleteResource(1);
      expect(component.errorMessage).toBe('Error eliminando recurso: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });
  });

  describe('createEvaluation', () => {
    it('should create evaluation and reload data', async () => {
      spyOn(apiService, 'createEvaluation').and.returnValue(of({}));
      spyOn(component, 'loadData');
      spyOn(window, 'alert');

      component.evaluationForm = { idRecurso: 1, fecha_inicio: '2025-08-01', fecha_fin: '2025-08-02', instrucciones: 'Test' };
      await component.createEvaluation(1);
      expect(apiService.createEvaluation).toHaveBeenCalledWith({
        idRecurso: 1,
        fecha_inicio: '2025-08-01',
        fecha_fin: '2025-08-02',
        instrucciones: 'Test'
      });
      expect(component.loadData).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Evaluación creada con éxito.');
      expect(component.showEvaluationOverlay).toBeFalse();
    });

    it('should handle error', async () => {
      spyOn(apiService, 'createEvaluation').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      component.evaluationForm = { idRecurso: 1, fecha_inicio: '2025-08-01', fecha_fin: '2025-08-02', instrucciones: 'Test' };
      await component.createEvaluation(1);
      expect(component.errorMessage).toBe('Error creando evaluación: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });
  });

  describe('openUploadOverlay', () => {
    it('should open upload overlay', () => {
      component.openUploadOverlay();
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

  describe('openEvaluationOverlay', () => {
    it('should open evaluation overlay', () => {
      component.openEvaluationOverlay(1);
      expect(component.evaluationForm.idRecurso).toBe(1);
      expect(component.showEvaluationOverlay).toBeTrue();
    });
  });

  describe('closeEvaluationOverlay', () => {
    it('should close evaluation overlay', () => {
      component.closeEvaluationOverlay();
      expect(component.showEvaluationOverlay).toBeFalse();
      expect(component.evaluationForm).toEqual({ idRecurso: 0, fecha_inicio: '', fecha_fin: '', instrucciones: '' });
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

  describe('getUserRole', () => {
    it('should return user role', () => {
      component.subscriptions = [{ idUsuario: 1, idVariante: 1, rol: 'admin' }];
      expect(component.getUserRole()).toBe('admin');
    });

    it('should return "none" if no subscription', () => {
      component.subscriptions = [];
      expect(component.getUserRole()).toBe('none');
    });
  });

  describe('toggleEvaluations', () => {
    it('should toggle showEvaluations state', () => {
      component.showEvaluations[1] = false;
      component.toggleEvaluations(1);
      expect(component.showEvaluations[1]).toBeTrue();
      component.toggleEvaluations(1);
      expect(component.showEvaluations[1]).toBeFalse();
    });
  });
});
