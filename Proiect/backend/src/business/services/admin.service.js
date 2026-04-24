import { prisma } from "../../data/prismaClient.js";
import { Mailer } from "../../lib/mailer.js";

const ALLOWED_ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
];

const ALLOWED_SHIPPING_METHODS = [
  "COURIER_STANDARD",
  "COURIER_EXPRESS",
  "EASYBOX",
];

const ALLOWED_PAYMENT_METHODS = ["CARD", "CASH_ON_DELIVERY"];

function normalizeRoleName(input) {
  const value = String(input || "").trim().toLowerCase();
  if (!value) return null;

  if (value === "admin") return "Admin";
  if (value === "user" || value === "client") return "User";

  return value;
}

export class AdminService {
  constructor() {
    this.mailer = new Mailer();
  }

  async sendEmailSafe(methodName, payload) {
    try {
      if (!payload?.to) return;
      if (!this.mailer?.[methodName]) return;

      await this.mailer[methodName](payload);
    } catch (error) {
      console.error(`Eroare la trimiterea emailului ${methodName}:`, error);
    }
  }

  async sendOrderStatusUpdateEmailSafe(order) {
    await this.sendEmailSafe("sendOrderStatusUpdateEmail", {
      to: order?.customerEmail,
      order,
    });
  }

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

  async getOrderById(orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order) {
      throw new Error("Comanda nu există.");
    }

    return order;
  }

  async updateOrder(orderId, payload) {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!existingOrder) {
      throw new Error("Comanda nu există.");
    }

    const previousStatus = existingOrder.status;
    const data = {};

    if (payload.status !== undefined) {
      const normalizedStatus = String(payload.status).trim().toUpperCase();

      if (!ALLOWED_ORDER_STATUSES.includes(normalizedStatus)) {
        throw new Error("Statusul comenzii este invalid.");
      }

      data.status = normalizedStatus;
    }

    if (payload.customerName !== undefined) {
      const value = String(payload.customerName).trim();

      if (value.length < 2) {
        throw new Error("Numele clientului trebuie să aibă minim 2 caractere.");
      }

      data.customerName = value;
    }

    if (payload.customerEmail !== undefined) {
      const value = String(payload.customerEmail).trim().toLowerCase();

      if (!value || !value.includes("@")) {
        throw new Error("Emailul clientului este invalid.");
      }

      data.customerEmail = value;
    }

    if (payload.customerPhone !== undefined) {
      const value = String(payload.customerPhone || "").trim();
      data.customerPhone = value || null;
    }

    let nextShippingMethod = existingOrder.shippingMethod;

    if (payload.shippingMethod !== undefined) {
      const normalizedShippingMethod = String(payload.shippingMethod)
        .trim()
        .toUpperCase();

      if (!ALLOWED_SHIPPING_METHODS.includes(normalizedShippingMethod)) {
        throw new Error("Metoda de livrare este invalidă.");
      }

      data.shippingMethod = normalizedShippingMethod;
      nextShippingMethod = normalizedShippingMethod;
    }

    if (payload.paymentMethod !== undefined) {
      const normalizedPaymentMethod = String(payload.paymentMethod)
        .trim()
        .toUpperCase();

      if (!ALLOWED_PAYMENT_METHODS.includes(normalizedPaymentMethod)) {
        throw new Error("Metoda de plată este invalidă.");
      }

      data.paymentMethod = normalizedPaymentMethod;
    }

    if (payload.shippingCounty !== undefined) {
      const value = String(payload.shippingCounty || "").trim();

      if (value.length < 2) {
        throw new Error("Județul trebuie să aibă minim 2 caractere.");
      }

      data.shippingCounty = value;
    }

    if (payload.shippingCity !== undefined) {
      const value = String(payload.shippingCity || "").trim();

      if (value.length < 2) {
        throw new Error("Orașul trebuie să aibă minim 2 caractere.");
      }

      data.shippingCity = value;
    }

    if (payload.shippingPostalCode !== undefined) {
      const value = String(payload.shippingPostalCode || "").trim();
      data.shippingPostalCode = value || null;
    }

    if (nextShippingMethod === "EASYBOX") {
      if (payload.easyboxLockerId !== undefined) {
        const value = String(payload.easyboxLockerId || "").trim();

        if (!value) {
          throw new Error("easyboxLockerId este obligatoriu pentru EasyBox.");
        }

        data.easyboxLockerId = value;
      }

      if (payload.easyboxLockerName !== undefined) {
        const value = String(payload.easyboxLockerName || "").trim();

        if (!value) {
          throw new Error("Numele lockerului este obligatoriu pentru EasyBox.");
        }

        data.easyboxLockerName = value;
      }

      if (payload.easyboxCity !== undefined) {
        const value = String(payload.easyboxCity || "").trim();

        if (!value) {
          throw new Error("Orașul EasyBox este obligatoriu.");
        }

        data.easyboxCity = value;
      }

      data.shippingStreet = null;
    } else {
      if (payload.shippingStreet !== undefined) {
        const value = String(payload.shippingStreet || "").trim();

        if (value.length < 3) {
          throw new Error("Adresa de livrare trebuie să aibă minim 3 caractere.");
        }

        data.shippingStreet = value;
      }

      data.easyboxLockerId = null;
      data.easyboxLockerName = null;
      data.easyboxCity = null;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data,
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

    if (updatedOrder.status !== previousStatus) {
      await this.sendOrderStatusUpdateEmailSafe(updatedOrder);
    }

    return updatedOrder;
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

  async updateUser(userId, payload) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: true,
      },
    });

    if (!existingUser) {
      throw new Error("Utilizatorul nu există.");
    }

    const updateData = {};

    if (payload.name !== undefined) {
      const value = String(payload.name || "").trim();

      if (value.length < 2) {
        throw new Error("Numele trebuie să aibă minim 2 caractere.");
      }

      updateData.name = value;
    }

    if (payload.email !== undefined) {
      const value = String(payload.email || "").trim().toLowerCase();

      if (!value || !value.includes("@")) {
        throw new Error("Email invalid.");
      }

      const emailTaken = await prisma.user.findFirst({
        where: {
          email: value,
          NOT: { id: userId },
        },
        select: { id: true },
      });

      if (emailTaken) {
        throw new Error("Există deja un utilizator cu acest email.");
      }

      updateData.email = value;
    }

    if (payload.phone !== undefined) {
      const value = String(payload.phone || "").trim();
      updateData.phone = value || null;
    }

    if (payload.dateOfBirth !== undefined) {
      updateData.dateOfBirth = payload.dateOfBirth
        ? new Date(payload.dateOfBirth)
        : null;
    }

    const roleNameNormalized =
      payload.roleName !== undefined ? normalizeRoleName(payload.roleName) : null;

    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      if (roleNameNormalized) {
        const role = await tx.role.findFirst({
          where: {
            name: {
              equals: roleNameNormalized,
              mode: "insensitive",
            },
          },
        });

        if (!role) {
          throw new Error(`Rolul "${payload.roleName}" nu există în baza de date.`);
        }

        await tx.userRole.deleteMany({
          where: { userId },
        });

        await tx.userRole.create({
          data: {
            userId,
            roleId: role.id,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    });
  }

  async listProducts() {
    return prisma.product.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async createProduct(payload) {
    const name = String(payload.name || "").trim();
    const brand = String(payload.brand || "").trim();
    const category = String(payload.category || "").trim();

    if (name.length < 2) {
      throw new Error("Numele produsului trebuie să aibă minim 2 caractere.");
    }

    if (brand.length < 1) {
      throw new Error("Brandul este obligatoriu.");
    }

    if (category.length < 1) {
      throw new Error("Categoria este obligatorie.");
    }

    const priceRon = Number(payload.priceRon || 0);
    const stock = Number(payload.stock || 0);

    if (!Number.isFinite(priceRon) || priceRon < 0) {
      throw new Error("Prețul produsului este invalid.");
    }

    if (!Number.isFinite(stock) || stock < 0) {
      throw new Error("Stocul produsului este invalid.");
    }

    return prisma.product.create({
      data: {
        name,
        brand,
        category,
        imageUrl: payload.imageUrl ? String(payload.imageUrl).trim() : null,
        priceRon,
        originalPriceRon:
          payload.originalPriceRon === null ||
          payload.originalPriceRon === undefined ||
          payload.originalPriceRon === ""
            ? null
            : Number(payload.originalPriceRon),
        stock,
        badge: payload.badge ? String(payload.badge).trim() : null,
        isActive:
          payload.isActive === undefined ? true : Boolean(payload.isActive),
        shortDescription: payload.shortDescription
          ? String(payload.shortDescription).trim()
          : null,
        description: payload.description
          ? String(payload.description).trim()
          : null,
      },
    });
  }

  async updateProduct(productId, payload) {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new Error("Produsul nu există.");
    }

    const data = {};

    if (payload.name !== undefined) {
      const value = String(payload.name || "").trim();

      if (value.length < 2) {
        throw new Error("Numele produsului trebuie să aibă minim 2 caractere.");
      }

      data.name = value;
    }

    if (payload.brand !== undefined) {
      const value = String(payload.brand || "").trim();

      if (!value) {
        throw new Error("Brandul este obligatoriu.");
      }

      data.brand = value;
    }

    if (payload.category !== undefined) {
      const value = String(payload.category || "").trim();

      if (!value) {
        throw new Error("Categoria este obligatorie.");
      }

      data.category = value;
    }

    if (payload.imageUrl !== undefined) {
      data.imageUrl = payload.imageUrl ? String(payload.imageUrl).trim() : null;
    }

    if (payload.priceRon !== undefined) {
      const value = Number(payload.priceRon);

      if (!Number.isFinite(value) || value < 0) {
        throw new Error("Prețul produsului este invalid.");
      }

      data.priceRon = value;
    }

    if (payload.originalPriceRon !== undefined) {
      data.originalPriceRon =
        payload.originalPriceRon === null ||
        payload.originalPriceRon === ""
          ? null
          : Number(payload.originalPriceRon);
    }

    if (payload.stock !== undefined) {
      const value = Number(payload.stock);

      if (!Number.isFinite(value) || value < 0) {
        throw new Error("Stocul produsului este invalid.");
      }

      data.stock = value;
    }

    if (payload.badge !== undefined) {
      data.badge = payload.badge ? String(payload.badge).trim() : null;
    }

    if (payload.isActive !== undefined) {
      data.isActive = Boolean(payload.isActive);
    }

    if (payload.shortDescription !== undefined) {
      data.shortDescription = payload.shortDescription
        ? String(payload.shortDescription).trim()
        : null;
    }

    if (payload.description !== undefined) {
      data.description = payload.description
        ? String(payload.description).trim()
        : null;
    }

    return prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  async listPendingModeration() {
    const [reviews, questions, answers] = await Promise.all([
      prisma.productReview.findMany({
        where: {
          moderationStatus: "PENDING",
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              imageUrl: true,
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
      }),

      prisma.productQuestion.findMany({
        where: {
          moderationStatus: "PENDING",
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              imageUrl: true,
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
      }),

      prisma.productAnswer.findMany({
        where: {
          moderationStatus: "PENDING",
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          question: {
            select: {
              id: true,
              question: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  brand: true,
                  imageUrl: true,
                },
              },
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
      }),
    ]);

    return {
      reviews,
      questions,
      answers,
    };
  }

  async refreshProductReviewStats(tx, productId) {
    const stats = await tx.productReview.aggregate({
      where: {
        productId,
        isPublished: true,
        moderationStatus: "APPROVED",
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        rating: Number(stats._avg.rating || 0),
        reviews: Number(stats._count.id || 0),
      },
    });
  }

  async approveReview(reviewId, adminUserId) {
    const review = await prisma.$transaction(async (tx) => {
      const existingReview = await tx.productReview.findUnique({
        where: {
          id: reviewId,
        },
      });

      if (!existingReview) {
        throw new Error("Review-ul nu există.");
      }

      const updatedReview = await tx.productReview.update({
        where: {
          id: reviewId,
        },
        data: {
          isPublished: true,
          moderationStatus: "APPROVED",
          moderatedAt: new Date(),
          moderatedById: adminUserId || null,
          rejectionReason: null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              imageUrl: true,
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

      await this.refreshProductReviewStats(tx, updatedReview.productId);

      return updatedReview;
    });

    await this.sendEmailSafe("sendReviewApprovedEmail", {
      to: review.user?.email,
      name: review.user?.name || review.authorName,
      product: review.product,
      review,
    });

    return review;
  }

  async rejectReview(reviewId, adminUserId, rejectionReason) {
    const review = await prisma.$transaction(async (tx) => {
      const existingReview = await tx.productReview.findUnique({
        where: {
          id: reviewId,
        },
      });

      if (!existingReview) {
        throw new Error("Review-ul nu există.");
      }

      const updatedReview = await tx.productReview.update({
        where: {
          id: reviewId,
        },
        data: {
          isPublished: false,
          moderationStatus: "REJECTED",
          moderatedAt: new Date(),
          moderatedById: adminUserId || null,
          rejectionReason: rejectionReason || null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              imageUrl: true,
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

      if (existingReview.isPublished) {
        await this.refreshProductReviewStats(tx, existingReview.productId);
      }

      return updatedReview;
    });

    await this.sendEmailSafe("sendReviewRejectedEmail", {
      to: review.user?.email,
      name: review.user?.name || review.authorName,
      product: review.product,
      review,
    });

    return review;
  }

  async approveQuestion(questionId, adminUserId) {
    const existingQuestion = await prisma.productQuestion.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!existingQuestion) {
      throw new Error("Întrebarea nu există.");
    }

    const question = await prisma.productQuestion.update({
      where: {
        id: questionId,
      },
      data: {
        isPublished: true,
        moderationStatus: "APPROVED",
        moderatedAt: new Date(),
        moderatedById: adminUserId || null,
        rejectionReason: null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
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

    await this.sendEmailSafe("sendQuestionApprovedEmail", {
      to: question.user?.email,
      name: question.user?.name || question.authorName,
      product: question.product,
      question,
    });

    return question;
  }

  async rejectQuestion(questionId, adminUserId, rejectionReason) {
    const existingQuestion = await prisma.productQuestion.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!existingQuestion) {
      throw new Error("Întrebarea nu există.");
    }

    const question = await prisma.productQuestion.update({
      where: {
        id: questionId,
      },
      data: {
        isPublished: false,
        moderationStatus: "REJECTED",
        moderatedAt: new Date(),
        moderatedById: adminUserId || null,
        rejectionReason: rejectionReason || null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
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

    await this.sendEmailSafe("sendQuestionRejectedEmail", {
      to: question.user?.email,
      name: question.user?.name || question.authorName,
      product: question.product,
      question,
    });

    return question;
  }

  async addOfficialAnswer(questionId, adminUserId, answer) {
    const result = await prisma.$transaction(async (tx) => {
      const question = await tx.productQuestion.findUnique({
        where: {
          id: questionId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              imageUrl: true,
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

      if (!question) {
        throw new Error("Întrebarea nu există.");
      }

      if (
        question.moderationStatus !== "APPROVED" ||
        question.isPublished !== true
      ) {
        await tx.productQuestion.update({
          where: {
            id: questionId,
          },
          data: {
            isPublished: true,
            moderationStatus: "APPROVED",
            moderatedAt: new Date(),
            moderatedById: adminUserId || null,
            rejectionReason: null,
          },
        });
      }

      const adminUser = await tx.user.findUnique({
        where: {
          id: adminUserId,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      const authorName =
        adminUser?.name?.trim() || adminUser?.email || "Administrator";

      const createdAnswer = await tx.productAnswer.create({
        data: {
          questionId,
          userId: adminUserId || null,
          authorName,
          answer,
          isOfficial: true,
          isPublished: true,
          moderationStatus: "APPROVED",
          moderatedAt: new Date(),
          moderatedById: adminUserId || null,
          rejectionReason: null,
        },
        include: {
          question: {
            select: {
              id: true,
              question: true,
              authorName: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                  brand: true,
                  imageUrl: true,
                },
              },
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

      return createdAnswer;
    });

    if (result.question?.user?.email && result.question.userId !== adminUserId) {
      await this.sendEmailSafe("sendQuestionAnsweredEmail", {
        to: result.question.user.email,
        name: result.question.user.name || result.question.authorName,
        product: result.question.product,
        question: result.question,
        answer: result,
      });
    }

    return result;
  }

  async approveAnswer(answerId, adminUserId) {
    const existingAnswer = await prisma.productAnswer.findUnique({
      where: {
        id: answerId,
      },
    });

    if (!existingAnswer) {
      throw new Error("Răspunsul nu există.");
    }

    const answer = await prisma.productAnswer.update({
      where: {
        id: answerId,
      },
      data: {
        isPublished: true,
        moderationStatus: "APPROVED",
        moderatedAt: new Date(),
        moderatedById: adminUserId || null,
        rejectionReason: null,
      },
      include: {
        question: {
          select: {
            id: true,
            question: true,
            authorName: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                imageUrl: true,
              },
            },
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

    await this.sendEmailSafe("sendAnswerApprovedEmail", {
      to: answer.user?.email,
      name: answer.user?.name || answer.authorName,
      product: answer.question?.product,
      question: answer.question,
      answer,
    });

    if (
      answer.question?.user?.email &&
      answer.question.userId !== answer.user?.id
    ) {
      await this.sendEmailSafe("sendQuestionAnsweredEmail", {
        to: answer.question.user.email,
        name: answer.question.user.name || answer.question.authorName,
        product: answer.question.product,
        question: answer.question,
        answer,
      });
    }

    return answer;
  }

  async rejectAnswer(answerId, adminUserId, rejectionReason) {
    const existingAnswer = await prisma.productAnswer.findUnique({
      where: {
        id: answerId,
      },
    });

    if (!existingAnswer) {
      throw new Error("Răspunsul nu există.");
    }

    const answer = await prisma.productAnswer.update({
      where: {
        id: answerId,
      },
      data: {
        isPublished: false,
        moderationStatus: "REJECTED",
        moderatedAt: new Date(),
        moderatedById: adminUserId || null,
        rejectionReason: rejectionReason || null,
      },
      include: {
        question: {
          select: {
            id: true,
            question: true,
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                imageUrl: true,
              },
            },
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

    await this.sendEmailSafe("sendAnswerRejectedEmail", {
      to: answer.user?.email,
      name: answer.user?.name || answer.authorName,
      product: answer.question?.product,
      question: answer.question,
      answer,
    });

    return answer;
  }
}
