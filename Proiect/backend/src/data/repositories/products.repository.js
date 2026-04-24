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
          where: {
            isPublished: true,
            moderationStatus: "APPROVED",
          },
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
        brand: true,
        imageUrl: true,
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

  findExistingReviewByUser(productId, userId) {
    return this.prisma.productReview.findFirst({
      where: {
        productId,
        userId,
        moderationStatus: {
          in: ["PENDING", "APPROVED"],
        },
      },
      select: {
        id: true,
        moderationStatus: true,
      },
    });
  }

  findApprovedQuestionById(questionId) {
    return this.prisma.productQuestion.findFirst({
      where: {
        id: questionId,
        isPublished: true,
        moderationStatus: "APPROVED",
        product: {
          isActive: true,
        },
      },
      select: {
        id: true,
        productId: true,
        question: true,
        authorName: true,
        userId: true,
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
            isActive: true,
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
          where: {
            isPublished: true,
            moderationStatus: "APPROVED",
          },
          orderBy: { createdAt: "desc" },
        },
        questions: {
          where: {
            isPublished: true,
            moderationStatus: "APPROVED",
          },
          orderBy: { createdAt: "desc" },
          include: {
            answers: {
              where: {
                isPublished: true,
                moderationStatus: "APPROVED",
              },
              orderBy: [{ isOfficial: "desc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    });
  }

  createReview({
    productId,
    userId,
    authorName,
    title,
    content,
    rating,
  }) {
    return this.prisma.productReview.create({
      data: {
        productId,
        userId,
        authorName,
        title,
        content,
        rating,
        verifiedPurchase: false,
        isPublished: false,
        moderationStatus: "PENDING",
      },
    });
  }

  createQuestion({ productId, userId, authorName, question }) {
    return this.prisma.productQuestion.create({
      data: {
        productId,
        userId,
        authorName,
        question,
        isPublished: false,
        moderationStatus: "PENDING",
      },
    });
  }

  createAnswer({ questionId, userId, authorName, answer }) {
    return this.prisma.productAnswer.create({
      data: {
        questionId,
        userId,
        authorName,
        answer,
        isOfficial: false,
        isPublished: false,
        moderationStatus: "PENDING",
      },
    });
  }
}
