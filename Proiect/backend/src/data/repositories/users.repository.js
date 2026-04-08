const profileSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  dateOfBirth: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    include: {
      role: true,
    },
  },
};

const addressSelect = {
  id: true,
  userId: true,
  label: true,
  recipientName: true,
  phone: true,
  country: true,
  county: true,
  city: true,
  street: true,
  postalCode: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
};

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

  findProfileById(userId) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });
  }

  updateProfile(userId, data) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: profileSelect,
    });
  }

  findAddressesByUserId(userId) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      select: addressSelect,
    });
  }

  findAddressByIdForUser(userId, addressId) {
    return this.prisma.userAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
      select: addressSelect,
    });
  }

  createAddressForUser(data) {
    return this.prisma.$transaction(async (tx) => {
      const addressesCount = await tx.userAddress.count({
        where: { userId: data.userId },
      });

      const shouldBeDefault = data.isDefault === true || addressesCount === 0;

      if (shouldBeDefault) {
        await tx.userAddress.updateMany({
          where: {
            userId: data.userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.userAddress.create({
        data: {
          userId: data.userId,
          label: data.label,
          recipientName: data.recipientName,
          phone: data.phone,
          country: data.country,
          county: data.county,
          city: data.city,
          street: data.street,
          postalCode: data.postalCode,
          isDefault: shouldBeDefault,
        },
        select: addressSelect,
      });
    });
  }

  updateAddressForUser(userId, addressId, data) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.userAddress.findFirst({
        where: {
          id: addressId,
          userId,
        },
        select: addressSelect,
      });

      if (!existing) {
        return null;
      }

      const shouldBeDefault = data.isDefault === true;

      if (shouldBeDefault) {
        await tx.userAddress.updateMany({
          where: {
            userId,
            isDefault: true,
            NOT: { id: addressId },
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.userAddress.update({
        where: { id: addressId },
        data: {
          ...(data.label !== undefined ? { label: data.label } : {}),
          ...(data.recipientName !== undefined
            ? { recipientName: data.recipientName }
            : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
          ...(data.country !== undefined ? { country: data.country } : {}),
          ...(data.county !== undefined ? { county: data.county } : {}),
          ...(data.city !== undefined ? { city: data.city } : {}),
          ...(data.street !== undefined ? { street: data.street } : {}),
          ...(data.postalCode !== undefined
            ? { postalCode: data.postalCode }
            : {}),
          ...(shouldBeDefault ? { isDefault: true } : {}),
        },
        select: addressSelect,
      });
    });
  }

  setDefaultAddressForUser(userId, addressId) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.userAddress.findFirst({
        where: {
          id: addressId,
          userId,
        },
        select: addressSelect,
      });

      if (!existing) {
        return null;
      }

      await tx.userAddress.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      return tx.userAddress.update({
        where: { id: addressId },
        data: {
          isDefault: true,
        },
        select: addressSelect,
      });
    });
  }

  deleteAddressForUser(userId, addressId) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.userAddress.findFirst({
        where: {
          id: addressId,
          userId,
        },
        select: addressSelect,
      });

      if (!existing) {
        return null;
      }

      await tx.userAddress.delete({
        where: { id: addressId },
      });

      if (existing.isDefault) {
        const remaining = await tx.userAddress.findFirst({
          where: { userId },
          orderBy: { updatedAt: "desc" },
        });

        if (remaining) {
          await tx.userAddress.update({
            where: { id: remaining.id },
            data: { isDefault: true },
          });
        }
      }

      return existing;
    });
  }
}