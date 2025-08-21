import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Resource } from '../../models/resource.model';
import { UserVariant } from '../../models/user-variant.model';
import { Evaluation } from '../../models/evaluation.model';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent implements OnInit {
  idVariante: number;
  variantName: string = '';
  resources: Resource[] = [];
  errorMessage: string = '';
  subscriptions: UserVariant[] = [];
  evaluations: { [key: number]: Evaluation[] } = {};
  showEvaluations: { [key: number]: boolean } = {};
  uploadForm = { idVariante: 0, titulo: '', descripcion: '', tipo: 'material', file: null as File | null };
  evaluationForm = { idRecurso: 0, fecha_inicio: '', fecha_fin: '', instrucciones: '' };
  showUploadOverlay = false;
  showEvaluationOverlay = false;
  loadingResources = false;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {
    this.idVariante = +this.route.snapshot.paramMap.get('idVariante')!;
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      this.loadingResources = true;
      const subscriptions = await this.apiService.getUserSubscriptions().toPromise();
      this.subscriptions = subscriptions ?? [];

      const variants = await this.apiService.getAllVariants().toPromise();
      const variant = variants?.find(v => v.idVariante === this.idVariante);
      this.variantName = variant?.nombre || 'Variante';

      const resources = await this.apiService.getResourcesByVariant(this.idVariante).toPromise();
      this.resources = resources ?? [];

      for (const resource of this.resources) {
        try {
          const evals = await this.apiService.getEvaluationsByResource(resource.idRecurso).toPromise();
          this.evaluations[resource.idRecurso] = evals ?? [];
          this.showEvaluations[resource.idRecurso] = false;
        } catch (err) {
          console.error(`Error fetching evaluations for resource ${resource.idRecurso}: ${err}`);
        }
      }
    } catch (err: any) {
      this.errorMessage = `Error cargando recursos: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    } finally {
      this.loadingResources = false;
    }
  }

  async downloadResource(id: number) {
    try {
      const blob = await this.apiService.downloadResource(id).toPromise();
      if (blob) {
        saveAs(blob, `resource_${id}.pdf`);
      } else {
        throw new Error('No se recibió un archivo válido');
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      this.errorMessage = `Error descargando recurso: ${errorMsg}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  async deleteResource(idRecurso: number) {
    try {
      await this.apiService.deleteResource(idRecurso).toPromise();
      await this.loadData();
    } catch (err: any) {
      this.errorMessage = `Error eliminando recurso: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  async createEvaluation(idRecurso: number) {
    try {
      await this.apiService.createEvaluation({
        idRecurso,
        fecha_inicio: this.evaluationForm.fecha_inicio,
        fecha_fin: this.evaluationForm.fecha_fin,
        instrucciones: this.evaluationForm.instrucciones
      }).toPromise();
      this.closeEvaluationOverlay();
      await this.loadData();
      alert('Evaluación creada con éxito.');
    } catch (err: any) {
      this.errorMessage = `Error creando evaluación: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  openUploadOverlay() {
    this.uploadForm.idVariante = this.idVariante;
    this.showUploadOverlay = true;
  }

  closeUploadOverlay() {
    this.showUploadOverlay = false;
    this.uploadForm = { idVariante: 0, titulo: '', descripcion: '', tipo: 'material', file: null };
  }

  openEvaluationOverlay(idRecurso: number) {
    this.evaluationForm.idRecurso = idRecurso;
    this.evaluationForm.fecha_inicio = '';
    this.evaluationForm.fecha_fin = '';
    this.evaluationForm.instrucciones = '';
    this.showEvaluationOverlay = true;
  }

  closeEvaluationOverlay() {
    this.showEvaluationOverlay = false;
    this.evaluationForm = { idRecurso: 0, fecha_inicio: '', fecha_fin: '', instrucciones: '' };
  }

  async uploadResource(event: Event) {
    event.preventDefault();
    if (!this.uploadForm.file || this.uploadForm.file.type !== 'application/pdf') {
      this.errorMessage = 'Por favor, selecciona un archivo PDF válido';
      setTimeout(() => (this.errorMessage = ''), 3500);
      return;
    }
    const formData = new FormData();
    formData.append('titulo', this.uploadForm.titulo);
    formData.append('descripcion', this.uploadForm.descripcion);
    formData.append('tipo', this.uploadForm.titulo);
    formData.append('file', this.uploadForm.file);
    try {
      await this.apiService.createResource(this.uploadForm.idVariante, formData).toPromise();
      this.closeUploadOverlay();
      await this.loadData();
      alert('Recurso subido con éxito.');
    } catch (err: any) {
      this.errorMessage = `Error subiendo recurso: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadForm.file = input.files[0];
    }
  }

  getUserRole(): string {
    const s = this.subscriptions.find(s => s.idVariante === this.idVariante);
    return s ? s.rol : 'none';
  }

  toggleEvaluations(idRecurso: number) {
    this.showEvaluations[idRecurso] = !this.showEvaluations[idRecurso];
  }
}
