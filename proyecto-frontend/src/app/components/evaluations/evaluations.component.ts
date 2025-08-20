import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Evaluation } from '../../models/evaluation.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.css']
})
export class EvaluationsComponent implements OnInit {
  idRecurso: number;
  resourceTitle: string = '';
  evaluations: Evaluation[] = [];
  errorMessage = '';

  constructor(private apiService: ApiService, private route: ActivatedRoute) {
    this.idRecurso = +this.route.snapshot.paramMap.get('idRecurso')!;
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const resources = await this.apiService.getResourcesByUser().toPromise();
      const resource = resources?.find(r => r.idRecurso === this.idRecurso);
      this.resourceTitle = resource?.titulo || 'Recurso';

      const evaluations = await this.apiService.getEvaluationsByResource(this.idRecurso).toPromise();
      this.evaluations = evaluations ?? [];
    } catch (err: any) {
      this.errorMessage = `Error cargando evaluaciones: ${err.message}`;
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }

  performEvaluation(idEvaluacion: number) {
    // Placeholder for evaluation action
    alert(`Iniciando evaluación ${idEvaluacion}...`);
    // If a specific backend endpoint or form is needed, it can be implemented here
  }
}
