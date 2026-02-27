export class RolesRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  getAll() {
    return this.prisma.role.findMany({
      orderBy: { id: "asc" },
    });
  }

  findById(id) {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  findByName(name) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  createRole(data) {
    return this.prisma.role.create({
      data,
    });
  }
}