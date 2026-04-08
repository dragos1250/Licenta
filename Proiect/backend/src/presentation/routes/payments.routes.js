import { Router } from "express";
import {
  createPaymentIntentAuth,
  createPaymentIntentGuest,
} from "../controllers/payments.controller.js";

// IMPORTANT:
// înlocuiește requireAuth cu ACELAȘI middleware pe care îl folosești
// deja pe ruta ta /orders/checkout.
import { requireAuth } from "../middlewares/auth.middleware.js";

export function paymentsRoutes() {
  const router = Router();

  router.post("/create-intent-auth", requireAuth, createPaymentIntentAuth);
  router.post("/create-intent-guest", createPaymentIntentGuest);

  return router;
}