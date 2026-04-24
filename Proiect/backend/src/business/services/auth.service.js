import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export class AuthService {
  constructor(authRepository, options = {}) {
    this.authRepository = authRepository;
    this.mailer = options.mailer || null;
    this.googleClient = options.googleClient || null;
  }

  normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  mapUserForClient(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }

  signAccessToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.role.name),
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  generateToken({ expiresInMs }) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + expiresInMs);

    return {
      rawToken,
      tokenHash,
      expiresAt,
    };
  }

  generateEmailVerificationToken() {
    return this.generateToken({
      expiresInMs: 24 * 60 * 60 * 1000,
    });
  }

  generatePasswordResetToken() {
    return this.generateToken({
      expiresInMs: 60 * 60 * 1000,
    });
  }

  buildVerificationUrl(rawToken) {
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return `${frontendUrl}/verify-email?token=${rawToken}`;
  }

  buildPasswordResetUrl(rawToken) {
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return `${frontendUrl}/reset-password?token=${rawToken}`;
  }

  async sendVerificationEmail(user, rawToken) {
    const verificationUrl = this.buildVerificationUrl(rawToken);

    if (!this.mailer?.sendVerificationEmail) {
      console.log("==========================================");
      console.log("EMAIL VERIFICATION LINK:");
      console.log(verificationUrl);
      console.log("==========================================");
      return;
    }

    await this.mailer.sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
    });
  }

  async sendPasswordResetEmail(user, rawToken) {
    const resetUrl = this.buildPasswordResetUrl(rawToken);

    if (!this.mailer?.sendPasswordResetEmail) {
      console.log("==========================================");
      console.log("PASSWORD RESET LINK:");
      console.log(resetUrl);
      console.log("==========================================");
      return;
    }

    await this.mailer.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });
  }

  async register({ name, email, password }) {
    const normalizedEmail = this.normalizeEmail(email);

    const existingUser = await this.authRepository.findUserByEmail(
      normalizedEmail
    );
    if (existingUser) {
      throw new Error("Există deja un cont cu acest email.");
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.authRepository.registerUserWithDefaultRole({
      name,
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
      emailVerifiedAt: null,
    });

    const { rawToken, tokenHash, expiresAt } =
      this.generateEmailVerificationToken();

    await this.authRepository.createEmailVerificationToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.sendVerificationEmail(user, rawToken);

    return {
      message:
        "Cont creat cu succes. Verifică emailul pentru activarea contului.",
      user: this.mapUserForClient(user),
      requiresEmailVerification: true,
    };
  }

  async login({ email, password }) {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.authRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new Error("Email sau parolă incorectă.");
    }

    if (!user.passwordHash) {
      throw new Error(
        "Acest cont nu are parolă locală. Folosește autentificarea cu Google."
      );
    }

    const isValidPassword = await argon2.verify(user.passwordHash, password);
    if (!isValidPassword) {
      throw new Error("Email sau parolă incorectă.");
    }

    if (!user.emailVerified) {
      throw new Error(
        "Contul nu este verificat. Verifică emailul înainte de autentificare."
      );
    }

    const token = this.signAccessToken(user);

    return {
      user: this.mapUserForClient(user),
      token,
    };
  }

  async loginWithGoogle({ credential }) {
    if (!this.googleClient) {
      throw new Error("Autentificarea cu Google nu este configurată încă.");
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
      throw new Error("Token Google invalid.");
    }

    const googleId = payload.sub;
    const email = this.normalizeEmail(payload.email);
    const name = payload.name || payload.given_name || "Utilizator Google";
    const avatarUrl = payload.picture || null;

    let user = await this.authRepository.findUserByGoogleId(googleId);

    if (!user) {
      const existingUserByEmail = await this.authRepository.findUserByEmail(
        email
      );

      if (existingUserByEmail) {
        user = existingUserByEmail.googleId
          ? existingUserByEmail
          : await this.authRepository.linkGoogleAccount(existingUserByEmail.id, {
              googleId,
              avatarUrl,
            });
      }
    }

    if (!user) {
      user = await this.authRepository.registerUserWithDefaultRole({
        name,
        email,
        passwordHash: null,
        googleId,
        avatarUrl,
        emailVerified: false,
        emailVerifiedAt: null,
      });

      const { rawToken, tokenHash, expiresAt } =
        this.generateEmailVerificationToken();

      await this.authRepository.createEmailVerificationToken({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      await this.sendVerificationEmail(user, rawToken);

      return {
        message:
          "Contul Google a fost creat. Verifică emailul pentru activarea contului.",
        user: this.mapUserForClient(user),
        requiresEmailVerification: true,
      };
    }

    if (!user.emailVerified) {
      throw new Error(
        "Contul există, dar nu este verificat pe email. Verifică emailul înainte de autentificare."
      );
    }

    const token = this.signAccessToken(user);

    return {
      user: this.mapUserForClient(user),
      token,
    };
  }

  async verifyEmail(rawToken) {
    if (!rawToken) {
      throw new Error("Tokenul de verificare lipsește.");
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const verificationRecord =
      await this.authRepository.findValidEmailVerificationToken(tokenHash);

    if (!verificationRecord) {
      throw new Error("Token invalid sau expirat.");
    }

    const user = await this.authRepository.markUserAsEmailVerified(
      verificationRecord.userId
    );

    await this.authRepository.markEmailVerificationTokenAsUsed(
      verificationRecord.id
    );

    const token = this.signAccessToken(user);

    return {
      message: "Cont confirmat cu succes.",
      user: this.mapUserForClient(user),
      token,
    };
  }

  async resendVerificationEmail({ email }) {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.authRepository.findUserByEmail(normalizedEmail);

    if (!user) {
      throw new Error("Nu există niciun cont cu acest email.");
    }

    if (user.emailVerified) {
      throw new Error("Contul este deja verificat.");
    }

    const { rawToken, tokenHash, expiresAt } =
      this.generateEmailVerificationToken();

    await this.authRepository.createEmailVerificationToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.sendVerificationEmail(user, rawToken);

    return {
      message: "Emailul de confirmare a fost retrimis.",
    };
  }

  async forgotPassword({ email }) {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.authRepository.findUserByEmail(normalizedEmail);

    if (!user) {
      return {
        message:
          "Dacă există un cont asociat acestui email, vei primi instrucțiuni pentru resetarea parolei.",
      };
    }

    const { rawToken, tokenHash, expiresAt } =
      this.generatePasswordResetToken();

    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.sendPasswordResetEmail(user, rawToken);

    return {
      message:
        "Dacă există un cont asociat acestui email, vei primi instrucțiuni pentru resetarea parolei.",
    };
  }

  async resetPassword({ token, newPassword }) {
    if (!token) {
      throw new Error("Tokenul de resetare lipsește.");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord =
      await this.authRepository.findValidPasswordResetToken(tokenHash);

    if (!resetRecord) {
      throw new Error("Link invalid sau expirat.");
    }

    const passwordHash = await argon2.hash(newPassword);

    await this.authRepository.updateUserPassword(
      resetRecord.userId,
      passwordHash
    );
    await this.authRepository.markPasswordResetTokenAsUsed(resetRecord.id);

    return {
      message: "Parola a fost resetată cu succes. Te poți autentifica acum.",
    };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new Error("Utilizatorul nu a fost găsit.");
    }

    if (!user.passwordHash) {
      throw new Error(
        "Acest cont nu are parolă locală. Te-ai autentificat cu Google."
      );
    }

    const isValidPassword = await argon2.verify(
      user.passwordHash,
      currentPassword
    );

    if (!isValidPassword) {
      throw new Error("Parola curentă este incorectă.");
    }

    const isSameAsOld = await argon2.verify(user.passwordHash, newPassword);

    if (isSameAsOld) {
      throw new Error(
        "Noua parolă trebuie să fie diferită de parola curentă."
      );
    }

    const passwordHash = await argon2.hash(newPassword);

    await this.authRepository.updateUserPassword(userId, passwordHash);

    return {
      message: "Parola a fost schimbată cu succes.",
    };
  }

  async deleteAccount(userId, { confirmationText, currentPassword }) {
    const normalizedConfirmation = String(confirmationText || "")
      .trim()
      .toUpperCase();

    if (normalizedConfirmation !== "STERGE") {
      throw new Error('Pentru confirmare, trebuie să scrii exact "STERGE".');
    }

    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new Error("Utilizatorul nu a fost găsit.");
    }

    if (user.passwordHash) {
      if (!currentPassword) {
        throw new Error("Parola curentă este obligatorie.");
      }

      const isValidPassword = await argon2.verify(
        user.passwordHash,
        currentPassword
      );

      if (!isValidPassword) {
        throw new Error("Parola curentă este incorectă.");
      }
    }

    await this.authRepository.deleteUserById(userId);

    return {
      message: "Contul a fost șters definitiv.",
    };
  }

  async getMe(userId) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("Utilizatorul nu a fost găsit.");
    }

    return this.mapUserForClient(user);
  }
}