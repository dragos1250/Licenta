export class BuildsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  getBuildItemInclude() {
    return {
      orderBy: {
        createdAt: "asc",
      },
    };
  }

  getProductSelect() {
    return {
      id: true,
      name: true,
      brand: true,
      category: true,
      imageUrl: true,
      priceRon: true,
      stock: true,
      isActive: true,
      compatibilityData: true,
    };
  }

  findActiveProductsByIds(productIds) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return [];
    }

    return this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: this.getProductSelect(),
    });
  }

  createBuild(data) {
    return this.prisma.build.create({
      data: {
        userId: data.userId,
        name: data.name,
        totalNetRon: data.totalNetRon,
        vatRate: data.vatRate,
        totalVatRon: data.totalVatRon,
        totalGrossRon: data.totalGrossRon,
        isCompatible: data.isCompatible,
        estimatedSystemPowerW: data.estimatedSystemPowerW,
        recommendedPsuW: data.recommendedPsuW,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            slotKey: item.slotKey,
            slotLabel: item.slotLabel,
            productName: item.productName,
            brand: item.brand,
            category: item.category,
            imageUrl: item.imageUrl,
            unitPriceRon: item.unitPriceRon,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: this.getBuildItemInclude(),
      },
    });
  }

  findManyByUserId(userId) {
    return this.prisma.build.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: this.getBuildItemInclude(),
      },
    });
  }

  findByIdAndUserId(id, userId) {
    return this.prisma.build.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  findByIdAndUserIdWithItems(id, userId) {
    return this.prisma.build.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: this.getBuildItemInclude(),
      },
    });
  }

  async updateBuild(data) {
    return this.prisma.$transaction(async (tx) => {
      await tx.buildItem.deleteMany({
        where: {
          buildId: data.buildId,
        },
      });

      if (data.items.length > 0) {
        await tx.buildItem.createMany({
          data: data.items.map((item) => ({
            buildId: data.buildId,
            productId: item.productId,
            slotKey: item.slotKey,
            slotLabel: item.slotLabel,
            productName: item.productName,
            brand: item.brand,
            category: item.category,
            imageUrl: item.imageUrl,
            unitPriceRon: item.unitPriceRon,
            quantity: item.quantity,
          })),
        });
      }

      return tx.build.update({
        where: {
          id: data.buildId,
        },
        data: {
          name: data.name,
          totalNetRon: data.totalNetRon,
          vatRate: data.vatRate,
          totalVatRon: data.totalVatRon,
          totalGrossRon: data.totalGrossRon,
          isCompatible: data.isCompatible,
          estimatedSystemPowerW: data.estimatedSystemPowerW,
          recommendedPsuW: data.recommendedPsuW,
        },
        include: {
          items: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    });
  }

  deleteById(id) {
    return this.prisma.build.delete({
      where: { id },
    });
  }
}
