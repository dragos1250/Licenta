export class RolesService {
  constructor(rolesRepository) {
    this.rolesRepository = rolesRepository;
  }

  async createRole({ name, description }) {
    const existing = await this.rolesRepository.findByName(name);
    if (existing) {
      throw new Error("Există deja un rol cu acest nume.");
    }

    return this.rolesRepository.createRole({
      name,
      description,
    });
  }

  async getRoles() {
    return this.rolesRepository.getAll();
  }
}