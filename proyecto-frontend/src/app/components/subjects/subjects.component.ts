import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Subject } from '../../models/subject.model';
import { UserVariant } from '../../models/user-variant.model';
import { AsyncVariantsPipe } from '../main/main.component';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AsyncVariantsPipe],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css']
})
export class SubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  subscriptions: UserVariant[] = [];
  variantInfo: { [key: number]: { nombre_asignatura: string; nombre_variante: string } } = {};
  subscribeForm = { idVariante: 0, rol: 'suscriptor' as 'suscriptor' | 'admin' };
  showSubscribeOverlay = false;
  showModifyRoleOverlay = false;
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

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

  async subscribe(idVariante: number) {
    try {
      await this.apiService.createUserVariant({ idVariante, rol: this.subscribeForm.rol }).toPromise();
      await this.apiService.createSubscription(idVariante).toPromise();
      this.closeSubscribeOverlay();
      await this.loadData();
    } catch (err: any) {
      this.errorMessage = `Error creando suscripción: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  async modifyRole(idVariante: number) {
    try {
      await this.apiService.updateUserVariantRole({ idVariante, rol: this.subscribeForm.rol }).toPromise();
      this.closeModifyRoleOverlay();
      await this.loadData();
    } catch (err: any) {
      this.errorMessage = `Error modificando rol: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  openSubscribeOverlay(idVariante: number) {
    this.subscribeForm.idVariante = idVariante;
    this.subscribeForm.rol = 'suscriptor';
    this.showSubscribeOverlay = true;
  }

  closeSubscribeOverlay() {
    this.showSubscribeOverlay = false;
    this.subscribeForm = { idVariante: 0, rol: 'suscriptor' };
  }

  openModifyRoleOverlay(idVariante: number, currentRole: string) {
    this.subscribeForm.idVariante = idVariante;
    this.subscribeForm.rol = currentRole as 'suscriptor' | 'admin';
    this.showModifyRoleOverlay = true;
  }

  closeModifyRoleOverlay() {
    this.showModifyRoleOverlay = false;
    this.subscribeForm = { idVariante: 0, rol: 'suscriptor' };
  }

  hasSubscription(idVariante: number): boolean {
    return this.subscriptions.some(s => s.idVariante === idVariante);
  }

  getUserRole(idVariante: number): string {
    const s = this.subscriptions.find(s => s.idVariante === idVariante);
    return s ? s.rol : 'none';
  }
}
