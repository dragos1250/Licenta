export class BuildsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findActiveProductsByIds(productIds) {
    return this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        imageUrl: true,
        priceRon: true,
        stock: true,
        isActive: true,
      },
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
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  findManyByUserId(userId) {
    return this.prisma.build.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
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

  deleteById(id) {
    return this.prisma.build.delete({
      where: { id },
    });
  }
}