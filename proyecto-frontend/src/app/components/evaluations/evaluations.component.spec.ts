import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvaluationsComponent } from './evaluations.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';
import { Evaluation } from '../../models/evaluation.model';
import { RouterTestingModule } from '@angular/router/testing';

describe('EvaluationsComponent', () => {
  let component: EvaluationsComponent;
  let fixture: ComponentFixture<EvaluationsComponent>;
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
      imports: [EvaluationsComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        ApiService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationsComponent);
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
    it('should load resource title and evaluations successfully', async () => {
      const mockResources = [{
        idRecurso: 1,
        titulo: 'Test Resource',
        idVariante: 1,
        tipo: 'tipo',
        descripcion: 'desc',
        file_path: 'path',
        creado_por: 1
      }];
      const mockEvaluations: Evaluation[] = [
        { idEvaluacion: 1, idRecurso: 1, fecha_inicio: '2025-08-01', fecha_fin: '2025-08-02', instrucciones: 'Test' }
      ];
      spyOn(apiService, 'getResourcesByUser').and.returnValue(of(mockResources));
      spyOn(apiService, 'getEvaluationsByResource').and.returnValue(of(mockEvaluations));

      await component.loadData();
      expect(component.resourceTitle).toBe('Test Resource');
      expect(component.evaluations).toEqual(mockEvaluations);
      expect(component.errorMessage).toBe('');
    });

    it('should handle error when loading data', async () => {
      spyOn(apiService, 'getResourcesByUser').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(window, 'setTimeout');

      await component.loadData();
      expect(component.errorMessage).toBe('Error cargando evaluaciones: API Error');
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3500);
    });

    it('should handle empty evaluations', async () => {
      spyOn(apiService, 'getResourcesByUser').and.returnValue(of([]));
      spyOn(apiService, 'getEvaluationsByResource').and.returnValue(of([]));

      await component.loadData();
      expect(component.resourceTitle).toBe('Recurso');
      expect(component.evaluations).toEqual([]);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('performEvaluation', () => {
    it('should show alert with evaluation ID', () => {
      spyOn(window, 'alert');
      component.performEvaluation(1);
      expect(window.alert).toHaveBeenCalledWith('Iniciando evaluación 1...');
    });
  });
});
