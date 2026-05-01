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

const googleLoginSchema = z.object({
  credential: z.string().min(1, "Credential Google este obligatoriu."),
});

const resendVerificationSchema = z.object({
  email: z.string().email("Email invalid."),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalid."),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Tokenul este obligatoriu."),
  newPassword: z
    .string()
    .min(8, "Parola trebuie să aibă minim 8 caractere.")
    .regex(/[A-Z]/, "Parola trebuie să conțină o literă mare.")
    .regex(/[0-9]/, "Parola trebuie să conțină un număr."),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Parola curentă este obligatorie."),
  newPassword: z
    .string()
    .min(8, "Parola trebuie să aibă minim 8 caractere.")
    .regex(/[A-Z]/, "Parola trebuie să conțină o literă mare.")
    .regex(/[0-9]/, "Parola trebuie să conțină un număr."),
});

const deleteAccountSchema = z.object({
  confirmationText: z.string().min(1, "Confirmarea este obligatorie."),
  currentPassword: z.string().optional(),
});

function isProductionLike() {
  return (
    process.env.NODE_ENV === "production" ||
    String(process.env.CLIENT_URL || "").startsWith("https://")
  );
}

function getCookieDomain() {
  const value = String(process.env.COOKIE_DOMAIN || "").trim();
  return value || undefined;
}

function getCookieOptions() {
  const isProd = isProductionLike();

  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };

  const domain = getCookieDomain();

  if (domain) {
    options.domain = domain;
  }

  return options;
}

function getClearCookieOptions() {
  const { maxAge, ...options } = getCookieOptions();
  return options;
}

function clearAuthCookie(res) {
  const currentOptions = getClearCookieOptions();

  // Cookie-ul curent, inclusiv domain=.configexp.ro dacă este setat.
  res.clearCookie("access_token", currentOptions);

  // Curăță și cookie-uri vechi create înainte de COOKIE_DOMAIN.
  const noDomainOptions = { ...currentOptions };
  delete noDomainOptions.domain;
  res.clearCookie("access_token", noDomainOptions);

  // Curăță și varianta veche cu SameSite=None, dacă a existat pe browser.
  const legacyCrossSiteOptions = {
    ...noDomainOptions,
    secure: true,
    sameSite: "none",
  };
  res.clearCookie("access_token", legacyCrossSiteOptions);

  if (currentOptions.domain) {
    res.clearCookie("access_token", {
      ...currentOptions,
      sameSite: "none",
    });
  }
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

      const result = await this.authService.register(parsed.data);

      return res.status(201).json(result);
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

  googleLogin = async (req, res, next) => {
    try {
      const parsed = googleLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const result = await this.authService.loginWithGoogle(parsed.data);

      if (result.token) {
        res.cookie("access_token", result.token, getCookieOptions());

        return res.json({
          message: "Autentificare cu Google reușită.",
          user: result.user,
        });
      }

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req, res, next) => {
    try {
      const tokenFromQuery = req.query.token;

      if (!tokenFromQuery || typeof tokenFromQuery !== "string") {
        return res.status(400).json({
          error: "Tokenul de verificare lipsește sau este invalid.",
        });
      }

      const { user, token, message } = await this.authService.verifyEmail(
        tokenFromQuery
      );

      res.cookie("access_token", token, getCookieOptions());

      return res.json({
        message,
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  resendVerificationEmail = async (req, res, next) => {
    try {
      const parsed = resendVerificationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const result = await this.authService.resendVerificationEmail(parsed.data);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const result = await this.authService.forgotPassword(parsed.data);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const result = await this.authService.resetPassword(parsed.data);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const result = await this.authService.changePassword(
        req.auth.userId,
        parsed.data
      );

      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteAccount = async (req, res, next) => {
    try {
      const parsed = deleteAccountSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const result = await this.authService.deleteAccount(
        req.auth.userId,
        parsed.data
      );

      clearAuthCookie(res);

      return res.json(result);
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
    clearAuthCookie(res);

    return res.json({ message: "Delogat cu succes." });
  };
}