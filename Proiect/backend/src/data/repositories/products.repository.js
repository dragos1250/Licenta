export class ProductsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findMany({ q, category, sort }) {
    const where = {
      isActive: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
    };

    const orderBy =
      sort === "priceAsc"
        ? { priceRon: "asc" }
        : sort === "priceDesc"
        ? { priceRon: "desc" }
        : { createdAt: "desc" };

    return this.prisma.product.findMany({
      where,
      orderBy,
      include: {
        reviewItems: {
          where: { isPublished: true },
          select: {
            rating: true,
          },
        },
      },
    });
  }

  getCategories() {
    return this.prisma.product.groupBy({
      by: ["category"],
      where: {
        isActive: true,
      },
      _count: { category: true },
      orderBy: { category: "asc" },
    });
  }

  findActiveById(id) {
    return this.prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  findUserIdentityById(userId) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  findPublishedReviewByUser(productId, userId) {
    return this.prisma.productReview.findFirst({
      where: {
        productId,
        userId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });
  }

  findByIdWithDetails(id) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        },
        specifications: {
          orderBy: { sortOrder: "asc" },
        },
        reviewItems: {
          where: { isPublished: true },
          orderBy: { createdAt: "desc" },
        },
        questions: {
          where: { isPublished: true },
          orderBy: { createdAt: "desc" },
          include: {
            answers: {
              where: { isPublished: true },
              orderBy: [{ isOfficial: "desc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    });
  }

  async createReviewAndRefreshStats({
    productId,
    userId,
    authorName,
    title,
    content,
    rating,
  }) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.productReview.create({
        data: {
          productId,
          userId,
          authorName,
          title,
          content,
          rating,
          verifiedPurchase: false,
          isPublished: true,
        },
      });

      const stats = await tx.productReview.aggregate({
        where: {
          productId,
          isPublished: true,
        },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: Number(stats._avg.rating || 0),
          reviews: Number(stats._count.id || 0),
        },
      });

      return review;
    });
  }

  createQuestion({ productId, userId, authorName, question }) {
    return this.prisma.productQuestion.create({
      data: {
        productId,
        userId,
        authorName,
        question,
        isPublished: true,
      },
    });
  }
}