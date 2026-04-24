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

  findUserByGoogleId(googleId) {
    return this.prisma.user.findUnique({
      where: { googleId },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  async registerUserWithDefaultRole({
    name,
    email,
    passwordHash = null,
    googleId = null,
    avatarUrl = null,
    emailVerified = false,
    emailVerifiedAt = null,
  }) {
    return this.prisma.$transaction(async (tx) => {
      const userRole = await tx.role.upsert({
        where: { name: "User" },
        update: {},
        create: {
          name: "User",
          description: "Utilizator standard",
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          googleId,
          avatarUrl,
          emailVerified,
          emailVerifiedAt,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id,
        },
      });

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

  async linkGoogleAccount(userId, { googleId, avatarUrl = null }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  createEmailVerificationToken({ userId, tokenHash, expiresAt }) {
    return this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  findValidEmailVerificationToken(tokenHash) {
    return this.prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            userRoles: {
              include: { role: true },
            },
          },
        },
      },
    });
  }

  markEmailVerificationTokenAsUsed(id) {
    return this.prisma.emailVerificationToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }

  markUserAsEmailVerified(userId) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  createPasswordResetToken({ userId, tokenHash, expiresAt }) {
    return this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  findValidPasswordResetToken(tokenHash) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            userRoles: {
              include: { role: true },
            },
          },
        },
      },
    });
  }

  markPasswordResetTokenAsUsed(id) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }

  updateUserPassword(userId, passwordHash) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });
  }

  deleteUserById(userId) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}