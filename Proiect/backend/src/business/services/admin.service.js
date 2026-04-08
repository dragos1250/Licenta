import { prisma } from "../../data/prismaClient.js";

export class AdminService {
  async listOrders() {
    return prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async listUsers() {
    return prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async listProducts() {
    return prisma.product.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
  }
}