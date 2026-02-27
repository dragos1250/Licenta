import argon2 from "argon2";

export class UsersService {
  constructor(usersRepository, rolesRepository) {
    this.usersRepository = usersRepository;
    this.rolesRepository = rolesRepository;
  }

  async createUser({ email, password, name }) {
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new Error("Există deja un utilizator cu acest email.");
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.usersRepository.createUser({
      email,
      name,
      passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  async getUsers() {
    const users = await this.usersRepository.getAll();

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
      roles: u.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
    }));
  }

  async assignRole(userId, roleId) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new Error("Utilizatorul nu există.");

    const role = await this.rolesRepository.findById(roleId);
    if (!role) throw new Error("Rolul nu există.");

    try {
      await this.usersRepository.assignRoleToUser(userId, roleId);
    } catch (err) {
      // dacă există deja combinația userId-roleId (cheie compusă)
      throw new Error("Rolul este deja asignat utilizatorului.");
    }

    return { message: "Rol asignat cu succes." };
  }
}