export class AiRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  getDateKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  async getUsageForDate(userId, dateKey = this.getDateKey()) {
    if (!userId) return null;

    return this.prisma.aiUsage.findUnique({
      where: {
        userId_dateKey: {
          userId,
          dateKey,
        },
      },
    });
  }

  async incrementUsageForDate(userId, dateKey = this.getDateKey()) {
    if (!userId) {
      throw new Error("Utilizatorul este obligatoriu pentru AI usage.");
    }

    return this.prisma.aiUsage.upsert({
      where: {
        userId_dateKey: {
          userId,
          dateKey,
        },
      },
      create: {
        userId,
        dateKey,
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
      },
    });
  }

  async findActiveProductsForAssistant() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          gt: 0,
        },
      },
      orderBy: [
        {
          category: "asc",
        },
        {
          brand: "asc",
        },
        {
          priceRon: "asc",
        },
      ],
      take: 250,
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        imageUrl: true,
        priceRon: true,
        originalPriceRon: true,
        stock: true,
        badge: true,
        shortDescription: true,
        description: true,
        compatibilityData: true,
        specifications: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            name: true,
            value: true,
          },
        },
      },
    });
  }
}
