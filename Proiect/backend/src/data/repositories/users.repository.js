export class UsersRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  getAll() {
    return this.prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  createUser(data) {
    return this.prisma.user.create({
      data,
    });
  }

  assignRoleToUser(userId, roleId) {
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }
}