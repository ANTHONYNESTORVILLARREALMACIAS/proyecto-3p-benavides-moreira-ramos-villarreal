class Resource {
  constructor({ idRecurso, idVariante, tipo, titulo, descripcion, file_path, creado_por }) {
    this.idRecurso = idRecurso;
    this.idVariante = idVariante;
    this.tipo = tipo;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.file_path = file_path;
    this.creado_por = creado_por;
  }
}

module.exports = Resource;