export class ConfiguratorRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  getConfiguratorProductSelect() {
    return {
      id: true,
      name: true,
      brand: true,
      category: true,
      imageUrl: true,
      priceRon: true,
      originalPriceRon: true,
      rating: true,
      reviews: true,
      badge: true,
      stock: true,
      isActive: true,
      compatibilityData: true,
    };
  }

  async findProductsByIds(ids) {
    if (!ids?.length) return [];

    return this.prisma.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
      select: this.getConfiguratorProductSelect(),
    });
  }

  async findProductsByCategory(category) {
    return this.prisma.product.findMany({
      where: {
        category,
        isActive: true,
        stock: { gt: 0 },
      },
      orderBy: [{ rating: "desc" }, { reviews: "desc" }, { createdAt: "desc" }],
      select: this.getConfiguratorProductSelect(),
    });
  }
}