import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă minim 2 caractere."),
  email: z.string().email("Email invalid."),
  password: z
    .string()
    .min(8, "Parola trebuie să aibă minim 8 caractere.")
    .regex(/[A-Z]/, "Parola trebuie să conțină o literă mare.")
    .regex(/[0-9]/, "Parola trebuie să conțină un număr."),
});

const loginSchema = z.object({
  email: z.string().email("Email invalid."),
  password: z.string().min(1, "Parola este obligatorie."),
});

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd, // true în producție (HTTPS)
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 zile
    path: "/",
  };
}

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const { user, token } = await this.authService.register(parsed.data);

      res.cookie("access_token", token, getCookieOptions());

      return res.status(201).json({
        message: "Cont creat cu succes.",
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const { user, token } = await this.authService.login(parsed.data);

      res.cookie("access_token", token, getCookieOptions());

      return res.json({
        message: "Autentificare reușită.",
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      const user = await this.authService.getMe(req.auth.userId);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res) => {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.json({ message: "Delogat cu succes." });
  };
}