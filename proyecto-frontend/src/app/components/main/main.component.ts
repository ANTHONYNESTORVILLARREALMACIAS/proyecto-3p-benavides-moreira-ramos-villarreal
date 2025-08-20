import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Subject } from '../../models/subject.model';
import { Variant } from '../../models/variant.model';
import { Resource } from '../../models/resource.model';
import { Evaluation } from '../../models/evaluation.model';
import { UserVariant } from '../../models/user-variant.model';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';

@Pipe({
  name: 'asyncVariants',
  standalone: true
})
export class AsyncVariantsPipe implements PipeTransform {
  constructor(private apiService: ApiService) {}
  transform(idAsignatura: number): Observable<Variant[]> {
    return this.apiService.getVariantsBySubject(idAsignatura);
  }
}

@Pipe({
  name: 'filterByVariant',
  standalone: true
})
export class FilterByVariantPipe implements PipeTransform {
  transform(resources: Resource[], idVariante: number): Resource[] {
    return resources.filter(r => r.idVariante === idVariante);
  }
}

@Pipe({
  name: 'filterByResource',
  standalone: true
})
export class FilterByResourcePipe implements PipeTransform {
  transform(evaluations: Evaluation[], idRecurso: number): Evaluation[] {
    return evaluations.filter(e => e.idRecurso === idRecurso);
  }
}

@Pipe({
  name: 'hasSubscription',
  standalone: true
})
export class HasSubscriptionPipe implements PipeTransform {
  transform(subscriptions: UserVariant[], idVariante: number): boolean {
    return subscriptions.some(s => s.idVariante === idVariante);
  }
}

@Pipe({
  name: 'getUserRole',
  standalone: true
})
export class GetUserRolePipe implements PipeTransform {
  transform(subscriptions: UserVariant[], idVariante: number): string {
    const s = subscriptions.find(s => s.idVariante === idVariante);
    return s ? s.rol : 'none';
  }
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncVariantsPipe, FilterByVariantPipe, FilterByResourcePipe, HasSubscriptionPipe, GetUserRolePipe],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  subjects: Subject[] = [];
  variantInfo: { [key: number]: { nombre_asignatura: string; nombre_variante: string } } = {};
  subscriptions: UserVariant[] = [];
  resources: Resource[] = [];
  evaluations: Evaluation[] = [];
  uploadForm = { idVariante: 0, titulo: '', descripcion: '', tipo: 'material', file: null as File | null };
  subscribeForm = { idVariante: 0, rol: 'suscriptor' as 'suscriptor' | 'admin' };
  showUploadOverlay = false;
  showSubscribeOverlay = false;
  errorMessage = '';
  selectedVariantId: number | null = null;
  loadingResources = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const subscriptions = await this.apiService.getUserSubscriptions().toPromise();
      this.subscriptions = subscriptions ?? [];

      const subjects = await this.apiService.getAllSubjects().toPromise();
      this.subjects = subjects ?? [];

      this.variantInfo = await this.buildVariantInfoMap(this.subjects);
      this.subscriptions.forEach(s => {
        const info = this.variantInfo[s.idVariante] || {};
        s.nombre_asignatura = info.nombre_asignatura || '';
        s.nombre_variante = info.nombre_variante || '';
      });
    } catch (err: any) {
      this.errorMessage = `Error cargando datos: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  async buildVariantInfoMap(subjects: Subject[]): Promise<{ [key: number]: { nombre_asignatura: string; nombre_variante: string } }> {
    const variantInfo: { [key: number]: { nombre_asignatura: string; nombre_variante: string } } = {};
    for (const sub of subjects) {
      try {
        const variants = await this.apiService.getVariantsBySubject(sub.idAsignatura).toPromise();
        if (variants) {
          variants.forEach(v => {
            variantInfo[v.idVariante] = {
              nombre_asignatura: sub.nombre,
              nombre_variante: v.nombre
            };
          });
        }
      } catch (err) {
        console.error(`Error fetching variants for subject ${sub.idAsignatura}: ${err}`);
      }
    }
    return variantInfo;
  }

  async toggleSubState(idVariante: number, state: 'activa' | 'inactiva') {
    try {
      await this.apiService.updateSubscriptionState(idVariante, state).toPromise();
      await this.loadData();
      if (this.selectedVariantId) {
        await this.loadResources(this.selectedVariantId);
      }
    } catch (err: any) {
      this.errorMessage = `Error actualizando suscripción: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  async subscribe(idVariante: number) {
    try {
      await this.apiService.createUserVariant({ idVariante, rol: this.subscribeForm.rol }).toPromise();
      await this.apiService.createSubscription(idVariante).toPromise();
      this.closeSubscribeOverlay();
      await this.loadData();
      if (this.selectedVariantId === idVariante) {
        await this.loadResources(idVariante);
      }
    } catch (err: any) {
      this.errorMessage = `Error creando suscripción: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  async loadResources(idVariante: number) {
    try {
      this.loadingResources = true;
      this.selectedVariantId = idVariante;
      const resources = await this.apiService.getResourcesByVariant(idVariante).toPromise();
      this.resources = resources ?? [];
      this.evaluations = [];
      for (const resource of this.resources) {
        const evals = await this.apiService.getEvaluationsByResource(resource.idRecurso).toPromise();
        this.evaluations.push(...(evals ?? []));
      }
    } catch (err: any) {
      this.errorMessage = `Error cargando recursos: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    } finally {
      this.loadingResources = false;
    }
  }

  async downloadResource(idRecurso: number) {
    try {
      const blob = await this.apiService.downloadResource(idRecurso).toPromise();
      if (blob) {
        saveAs(blob, `resource_${idRecurso}.pdf`);
      } else {
        throw new Error('No se pudo descargar el recurso');
      }
    } catch (err: any) {
      this.errorMessage = `Error descargando recurso: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  async deleteResource(idRecurso: number) {
    try {
      await this.apiService.deleteResource(idRecurso).toPromise();
      if (this.selectedVariantId) {
        await this.loadResources(this.selectedVariantId);
      }
    } catch (err: any) {
      this.errorMessage = `Error eliminando recurso: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  async openUploadOverlay(idVariante: number) {
    this.uploadForm.idVariante = idVariante;
    this.showUploadOverlay = true;
  }

  closeUploadOverlay() {
    this.showUploadOverlay = false;
    this.uploadForm = { idVariante: 0, titulo: '', descripcion: '', tipo: 'material', file: null };
  }

  async openSubscribeOverlay(idVariante: number) {
    this.subscribeForm.idVariante = idVariante;
    this.subscribeForm.rol = 'suscriptor';
    this.showSubscribeOverlay = true;
  }

  closeSubscribeOverlay() {
    this.showSubscribeOverlay = false;
    this.subscribeForm = { idVariante: 0, rol: 'suscriptor' };
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
    formData.append('tipo', this.uploadForm.tipo);
    formData.append('file', this.uploadForm.file);
    try {
      await this.apiService.createResource(this.uploadForm.idVariante, formData).toPromise();
      this.closeUploadOverlay();
      if (this.selectedVariantId) {
        await this.loadResources(this.selectedVariantId);
      }
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
}
