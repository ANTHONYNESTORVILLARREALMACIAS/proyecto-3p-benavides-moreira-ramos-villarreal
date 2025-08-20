class Subscription {
  constructor({ idSuscripcion, idUsuario, idVariante, state }) {
    this.idSuscripcion = idSuscripcion;
    this.idUsuario = idUsuario;
    this.idVariante = idVariante;
    this.state = state;
  }
}

module.exports = Subscription;