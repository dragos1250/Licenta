import { z } from "zod";

const addSchema = z.object({
  productId: z.string().min(1),
});

export class WishlistController {
  constructor(wishlistService) {
    this.wishlistService = wishlistService;
  }

  getMyWishlist = async (req, res, next) => {
    try {
      const data = await this.wishlistService.getMyWishlist(req.auth.userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  count = async (req, res, next) => {
    try {
      const data = await this.wishlistService.count(req.auth.userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  addItem = async (req, res, next) => {
    try {
      const parsed = addSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Date invalide", details: parsed.error.issues });

      const data = await this.wishlistService.addItem(req.auth.userId, parsed.data.productId);
      res.status(201).json(data);
    } catch (e) {
      next(e);
    }
  };

  removeItem = async (req, res, next) => {
    try {
      const data = await this.wishlistService.removeItem(req.auth.userId, req.params.productId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  clear = async (req, res, next) => {
    try {
      const data = await this.wishlistService.clear(req.auth.userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  removeUnavailable = async (req, res, next) => {
    try {
      const data = await this.wishlistService.removeUnavailable(req.auth.userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };
}