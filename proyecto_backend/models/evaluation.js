class Evaluation {
  constructor({ idEvaluacion, idRecurso, fecha_inicio, fecha_fin, instrucciones }) {
    this.idEvaluacion = idEvaluacion;
    this.idRecurso = idRecurso;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin = fecha_fin;
    this.instrucciones = instrucciones;
  }
}

module.exports = Evaluation;