class User {
  constructor({ idUsuario, username, password, email, born_date }) {
    this.idUsuario = idUsuario;
    this.username = username;
    this.password = password;
    this.email = email;
    this.born_date = born_date;
  }
}

module.exports = User;