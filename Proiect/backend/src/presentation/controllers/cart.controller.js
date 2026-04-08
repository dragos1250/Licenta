import { z } from "zod";

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

const qtySchema = z.object({
  quantity: z.number().int().min(1),
});

export class CartController {
  constructor(cartService) {
    this.cartService = cartService;
  }

  getCart = async (req, res, next) => {
    try {
      const data = await this.cartService.getCart(req.auth.userId);
      res.json(data);
    } catch (e) { next(e); }
  };

  addItem = async (req, res, next) => {
    try {
      const parsed = addSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Date invalide", details: parsed.error.issues });
      const data = await this.cartService.addItem(req.auth.userId, parsed.data.productId, parsed.data.quantity);
      res.status(201).json(data);
    } catch (e) { next(e); }
  };

  updateQuantity = async (req, res, next) => {
    try {
      const parsed = qtySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Date invalide", details: parsed.error.issues });
      const data = await this.cartService.updateQuantity(req.auth.userId, req.params.itemId, parsed.data.quantity);
      res.json(data);
    } catch (e) { next(e); }
  };

  removeItem = async (req, res, next) => {
    try {
      const data = await this.cartService.removeItem(req.auth.userId, req.params.itemId);
      res.json(data);
    } catch (e) { next(e); }
  };

  clear = async (req, res, next) => {
    try {
      const data = await this.cartService.clear(req.auth.userId);
      res.json(data);
    } catch (e) { next(e); }
  };
}