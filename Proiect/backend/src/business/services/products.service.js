import { Mailer } from "../../lib/mailer.js";

function normalizeJsonArray(value) {
  if (Array.isArray(value)) {
    return value.map((x) => String(x));
  }

  if (value && typeof value === "object") {
    return Object.values(value).map((x) => String(x));
  }

  return [];
}

function mapSpecificationsToObject(specifications) {
  const result = {};

  for (const spec of specifications || []) {
    if (!spec?.name) continue;
    result[spec.name] = spec.value;
  }

  return result;
}

function round1(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

export class ProductsService {
  constructor(productsRepository, options = {}) {
    this.productsRepository = productsRepository;
    this.mailer = options.mailer || new Mailer();
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

  async list(query) {
    const q = query.q?.trim() || undefined;
    const category = query.category?.trim() || undefined;
    const sort = query.sort?.trim() || undefined;

    const products = await this.productsRepository.findMany({ q, category, sort });

    const mapped = products.map((product) => {
      const reviewItems = Array.isArray(product.reviewItems)
        ? product.reviewItems
        : [];

      const reviewsCount = reviewItems.length;
      const realRating =
        reviewsCount > 0
          ? round1(
              reviewItems.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
                reviewsCount
            )
          : 0;

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        imageUrl: product.imageUrl,
        priceRon: product.priceRon,
        originalPriceRon: product.originalPriceRon,
        badge: product.badge,
        stock: product.stock,
        createdAt: product.createdAt,
        rating: realRating,
        reviews: reviewsCount,
      };
    });

    if (sort === "rating") {
      mapped.sort((a, b) => b.rating - a.rating);
    }

    return mapped;
  }

  async categories() {
    const rows = await this.productsRepository.getCategories();

    return rows.map((r) => ({
      category: r.category,
      count: r._count.category,
    }));
  }

  async detail(id) {
    const product = await this.productsRepository.findByIdWithDetails(id);

    if (!product || !product.isActive) {
      throw new Error("Produsul nu există.");
    }

    const features = normalizeJsonArray(product.features);
    const pros = normalizeJsonArray(product.pros);
    const cons = normalizeJsonArray(product.cons);

    const imageUrls =
      product.images?.map((img) => img.imageUrl).filter(Boolean) || [];

    const images =
      imageUrls.length > 0
        ? imageUrls
        : product.imageUrl
        ? [product.imageUrl]
        : [];

    const reviewsList = (product.reviewItems || []).map((review) => ({
      id: review.id,
      author: review.authorName,
      rating: review.rating,
      date: review.createdAt,
      verified: review.verifiedPurchase,
      title: review.title || "",
      content: review.content,
      helpful: review.helpfulCount,
      notHelpful: review.notHelpfulCount,
    }));

    const computedRating =
      reviewsList.length > 0
        ? round1(
            reviewsList.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
              reviewsList.length
          )
        : 0;

    const reviewCount = reviewsList.length;

    const questions = (product.questions || []).map((question) => ({
      id: question.id,
      author: question.authorName,
      question: question.question,
      date: question.createdAt,
      answers: (question.answers || []).map((answer) => ({
        id: answer.id,
        author: answer.authorName,
        answer: answer.answer,
        isOfficial: answer.isOfficial,
        date: answer.createdAt,
      })),
    }));

    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      priceRon: product.priceRon,
      originalPriceRon: product.originalPriceRon,
      stock: product.stock,
      rating: computedRating,
      reviewCount,
      imageUrl: images[0] || product.imageUrl || null,
      images,
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      features,
      specifications: mapSpecificationsToObject(product.specifications || []),
      specificationsList: (product.specifications || []).map((spec) => ({
        id: spec.id,
        name: spec.name,
        value: spec.value,
        sortOrder: spec.sortOrder,
      })),
      pros,
      cons,
      reviewsList,
      questions,
    };
  }

  async addReview(productId, { userId, email, title, content, rating }) {
    const product = await this.productsRepository.findActiveById(productId);

    if (!product) {
      throw new Error("Produsul nu există.");
    }

    const existing = await this.productsRepository.findExistingReviewByUser(
      productId,
      userId
    );

    if (existing) {
      throw new Error("Ai trimis deja un review pentru acest produs.");
    }

    const author = await this.productsRepository.findUserIdentityById(userId);
    const authorName =
      author?.name?.trim() || email || author?.email || "Utilizator";

    const review = await this.productsRepository.createReview({
      productId,
      userId,
      authorName,
      title,
      content,
      rating,
    });

    await this.sendEmailSafe("sendReviewSubmittedForModerationEmail", {
      to: author?.email || email,
      name: authorName,
      product,
      review,
    });

    return review;
  }

  async addQuestion(productId, { userId, email, question }) {
    const product = await this.productsRepository.findActiveById(productId);

    if (!product) {
      throw new Error("Produsul nu există.");
    }

    const author = await this.productsRepository.findUserIdentityById(userId);
    const authorName =
      author?.name?.trim() || email || author?.email || "Utilizator";

    const createdQuestion = await this.productsRepository.createQuestion({
      productId,
      userId,
      authorName,
      question,
    });

    await this.sendEmailSafe("sendQuestionSubmittedForModerationEmail", {
      to: author?.email || email,
      name: authorName,
      product,
      question: createdQuestion,
    });

    return createdQuestion;
  }

  async addAnswer(questionId, { userId, email, answer }) {
    const question = await this.productsRepository.findApprovedQuestionById(
      questionId
    );

    if (!question) {
      throw new Error("Întrebarea nu există sau nu este publică.");
    }

    const author = await this.productsRepository.findUserIdentityById(userId);
    const authorName =
      author?.name?.trim() || email || author?.email || "Utilizator";

    const createdAnswer = await this.productsRepository.createAnswer({
      questionId,
      userId,
      authorName,
      answer,
    });

    await this.sendEmailSafe("sendAnswerSubmittedForModerationEmail", {
      to: author?.email || email,
      name: authorName,
      product: question.product,
      question,
      answer: createdAnswer,
    });

    return createdAnswer;
  }
}
