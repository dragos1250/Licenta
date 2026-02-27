export class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findUserByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  findUserById(id) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  async registerUserWithDefaultRole({ name, email, passwordHash }) {
    return this.prisma.$transaction(async (tx) => {
      // creează rolul "User" dacă nu există
      const userRole = await tx.role.upsert({
        where: { name: "User" },
        update: {},
        create: {
          name: "User",
          description: "Utilizator standard",
        },
      });

      // creează utilizatorul
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      // leagă user-ul de rol
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id,
        },
      });

      // return user complet (cu roluri)
      const createdUser = await tx.user.findUnique({
        where: { id: user.id },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });

      return createdUser;
    });
  }
}