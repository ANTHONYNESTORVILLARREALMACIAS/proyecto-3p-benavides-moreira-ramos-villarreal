import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { UserVariant } from '../../models/user-variant.model';
import { Subject } from '../../models/subject.model';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit {
  subscriptions: UserVariant[] = [];
  variantInfo: { [key: number]: { nombre_asignatura: string; nombre_variante: string } } = {};
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const subscriptions = await this.apiService.getUserSubscriptions().toPromise();
      this.subscriptions = subscriptions ?? [];

      const subjects = await this.apiService.getAllSubjects().toPromise();
      this.variantInfo = await this.buildVariantInfoMap(subjects ?? []);
      this.subscriptions.forEach(s => {
        const info = this.variantInfo[s.idVariante] || {};
        s.nombre_asignatura = info.nombre_asignatura || '';
        s.nombre_variante = info.nombre_variante || '';
      });
    } catch (err: any) {
      this.errorMessage = `Error cargando suscripciones: ${err.message}`;
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
      const subscription = this.subscriptions.find(s => s.idVariante === idVariante);
      if (subscription) {
        await this.apiService.updateSubscriptionState(idVariante, state).toPromise();
      }
      await this.loadData();
    } catch (err: any) {
      this.errorMessage = `Error actualizando suscripción: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }
}
