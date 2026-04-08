import { z } from "zod";

const reviewSchema = z.object({
  title: z.string().trim().max(120).optional().or(z.literal("")),
  content: z
    .string()
    .trim()
    .min(10, "Review-ul trebuie să aibă minim 10 caractere.")
    .max(3000, "Review-ul este prea lung."),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating-ul minim este 1.")
    .max(5, "Rating-ul maxim este 5."),
});

const questionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(10, "Întrebarea trebuie să aibă minim 10 caractere.")
    .max(2000, "Întrebarea este prea lungă."),
});

export class ProductsController {
  constructor(productsService) {
    this.productsService = productsService;
  }

  list = async (req, res, next) => {
    try {
      const data = await this.productsService.list(req.query);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  categories = async (req, res, next) => {
    try {
      const data = await this.productsService.categories();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  detail = async (req, res, next) => {
    try {
      const data = await this.productsService.detail(req.params.id);
      res.json(data);
    } catch (e) {
      if (e.message === "Produsul nu există.") {
        return res.status(404).json({ error: e.message });
      }
      next(e);
    }
  };

  addReview = async (req, res, next) => {
    try {
      const parsed = reviewSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const result = await this.productsService.addReview(req.params.id, {
        userId: req.auth.userId,
        email: req.auth.email,
        ...parsed.data,
      });

      return res.status(201).json({
        message: "Review adăugat cu succes.",
        review: result,
      });
    } catch (e) {
      if (
        e.message === "Produsul nu există." ||
        e.message === "Ai trimis deja un review pentru acest produs."
      ) {
        return res.status(400).json({ error: e.message });
      }
      next(e);
    }
  };

  addQuestion = async (req, res, next) => {
    try {
      const parsed = questionSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const result = await this.productsService.addQuestion(req.params.id, {
        userId: req.auth.userId,
        email: req.auth.email,
        ...parsed.data,
      });

      return res.status(201).json({
        message: "Întrebarea a fost trimisă.",
        question: result,
      });
    } catch (e) {
      if (e.message === "Produsul nu există.") {
        return res.status(400).json({ error: e.message });
      }
      next(e);
    }
  };
}