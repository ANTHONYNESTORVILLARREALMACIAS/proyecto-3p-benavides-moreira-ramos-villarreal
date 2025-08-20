const UserVariantRepository = require('../repositories/userVariantRepository');

class UserVariantService {
  constructor() {
    this.userVariantRepository = new UserVariantRepository();
  }

  async create(userVariant) {
    try {
      const isSub = await this.userVariantRepository.isSubFromVariant(userVariant.idUsuario, userVariant.idVariante);
      const isAdmin = await this.userVariantRepository.isAdminFromVariant(userVariant.idUsuario, userVariant.idVariante);
      if (isSub || isAdmin) {
        const [result] = await this.userVariantRepository.pool.query(
          'UPDATE users_variants SET rol = ? WHERE idUsuario = ? AND idVariante = ?',
          [userVariant.rol, userVariant.idUsuario, userVariant.idVariante]
        );
        if (result.affectedRows === 0) {
          return { ok: false, msg: 'user-variant-update-failed' };
        }
        return { ok: true, msg: 'user-variant-updated' };
      }

      const result = await this.userVariantRepository.create(userVariant);
      return { ok: true, id: result.id, msg: 'user-variant-created' };
    } catch (error) {
      console.error(`UserVariantService create error: ${error.message}`);
      if (error.code === 'ER_DUP_ENTRY') {
        return { ok: false, msg: 'user-variant-already-exists' };
      }
      return { ok: false, msg: 'user-variant-creation-failed', error: error.message };
    }
  }

  async updateRole(idUsuario, idVariante, rol) {
    try {
      const [result] = await this.userVariantRepository.pool.query(
        'UPDATE users_variants SET rol = ? WHERE idUsuario = ? AND idVariante = ?',
        [rol, idUsuario, idVariante]
      );
      if (result.affectedRows === 0) {
        return { ok: false, msg: 'user-variant-not-found' };
      }
      return { ok: true, msg: 'user-variant-updated' };
    } catch (error) {
      console.error(`UserVariantService updateRole error: ${error.message}`);
      return { ok: false, msg: 'user-variant-update-failed', error: error.message };
    }
  }

  async isAdminFromVariant(idUsuario, idVariante) {
    return await this.userVariantRepository.isAdminFromVariant(idUsuario, idVariante);
  }

  async isSubFromVariant(idUsuario, idVariante) {
    return await this.userVariantRepository.isSubFromVariant(idUsuario, idVariante);
  }
}

module.exports = UserVariantService;