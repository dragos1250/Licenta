import { z } from "zod";

const updateOrderSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELED",
    ])
    .optional(),

  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),

  shippingMethod: z
    .enum(["COURIER_STANDARD", "COURIER_EXPRESS", "EASYBOX"])
    .optional(),

  paymentMethod: z.enum(["CARD", "CASH_ON_DELIVERY"]).optional(),

  shippingCounty: z.string().min(2).optional(),
  shippingCity: z.string().min(2).optional(),
  shippingStreet: z.string().optional(),
  shippingPostalCode: z.string().optional(),

  easyboxLockerId: z.string().optional(),
  easyboxLockerName: z.string().optional(),
  easyboxCity: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  roleName: z.string().optional(),
});

const productSpecificationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(500),
  sortOrder: z.number().int().min(0).optional(),
});

const productPayloadSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  priceRon: z.number().min(0),
  originalPriceRon: z.number().nullable().optional(),
  stock: z.number().min(0),
  badge: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  features: z.array(z.string().trim().min(1).max(500)).optional(),
  pros: z.array(z.string().trim().min(1).max(500)).optional(),
  cons: z.array(z.string().trim().min(1).max(500)).optional(),
  specifications: z.array(productSpecificationSchema).optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  brand: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  priceRon: z.number().min(0).optional(),
  originalPriceRon: z.number().nullable().optional(),
  stock: z.number().min(0).optional(),
  badge: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  features: z.array(z.string().trim().min(1).max(500)).optional(),
  pros: z.array(z.string().trim().min(1).max(500)).optional(),
  cons: z.array(z.string().trim().min(1).max(500)).optional(),
  specifications: z.array(productSpecificationSchema).optional(),
});

const rejectModerationSchema = z.object({
  reason: z.string().trim().max(1000).optional().or(z.literal("")),
});

const officialAnswerSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(2, "Răspunsul trebuie să aibă minim 2 caractere.")
    .max(3000, "Răspunsul este prea lung."),
});

export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  listOrders = async (req, res, next) => {
    try {
      const data = await this.adminService.listOrders();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getOrderById = async (req, res, next) => {
    try {
      const data = await this.adminService.getOrderById(req.params.id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  updateOrder = async (req, res, next) => {
    try {
      const parsed = updateOrderSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const data = await this.adminService.updateOrder(
        req.params.id,
        parsed.data
      );

      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  listUsers = async (req, res, next) => {
    try {
      const data = await this.adminService.listUsers();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  updateUser = async (req, res, next) => {
    try {
      const parsed = updateUserSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const data = await this.adminService.updateUser(req.params.id, parsed.data);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  listProducts = async (req, res, next) => {
    try {
      const data = await this.adminService.listProducts();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  createProduct = async (req, res, next) => {
    try {
      const parsed = productPayloadSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const data = await this.adminService.createProduct(parsed.data);
      return res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  updateProduct = async (req, res, next) => {
    try {
      const parsed = updateProductSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const data = await this.adminService.updateProduct(
        req.params.id,
        parsed.data
      );

      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  listPendingModeration = async (req, res, next) => {
    try {
      const data = await this.adminService.listPendingModeration();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  approveReview = async (req, res, next) => {
    try {
      const data = await this.adminService.approveReview(
        req.params.id,
        req.auth?.userId
      );

      return res.json({
        message: "Review-ul a fost aprobat.",
        review: data,
      });
    } catch (err) {
      next(err);
    }
  };

  rejectReview = async (req, res, next) => {
    try {
      const parsed = rejectModerationSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const data = await this.adminService.rejectReview(
        req.params.id,
        req.auth?.userId,
        parsed.data.reason
      );

      return res.json({
        message: "Review-ul a fost respins.",
        review: data,
      });
    } catch (err) {
      next(err);
    }
  };

  approveQuestion = async (req, res, next) => {
    try {
      const data = await this.adminService.approveQuestion(
        req.params.id,
        req.auth?.userId
      );

      return res.json({
        message: "Întrebarea a fost aprobată.",
        question: data,
      });
    } catch (err) {
      next(err);
    }
  };

  rejectQuestion = async (req, res, next) => {
    try {
      const parsed = rejectModerationSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const data = await this.adminService.rejectQuestion(
        req.params.id,
        req.auth?.userId,
        parsed.data.reason
      );

      return res.json({
        message: "Întrebarea a fost respinsă.",
        question: data,
      });
    } catch (err) {
      next(err);
    }
  };

  addOfficialAnswer = async (req, res, next) => {
    try {
      const parsed = officialAnswerSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const data = await this.adminService.addOfficialAnswer(
        req.params.id,
        req.auth?.userId,
        parsed.data.answer
      );

      return res.status(201).json({
        message: "Răspunsul oficial a fost publicat.",
        answer: data,
      });
    } catch (err) {
      next(err);
    }
  };

  approveAnswer = async (req, res, next) => {
    try {
      const data = await this.adminService.approveAnswer(
        req.params.id,
        req.auth?.userId
      );

      return res.json({
        message: "Răspunsul a fost aprobat.",
        answer: data,
      });
    } catch (err) {
      next(err);
    }
  };

  rejectAnswer = async (req, res, next) => {
    try {
      const parsed = rejectModerationSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const data = await this.adminService.rejectAnswer(
        req.params.id,
        req.auth?.userId,
        parsed.data.reason
      );

      return res.json({
        message: "Răspunsul a fost respins.",
        answer: data,
      });
    } catch (err) {
      next(err);
    }
  };
}