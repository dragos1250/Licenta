import argon2 from "argon2";
import jwt from "jsonwebtoken";

export class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  mapUserForClient(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
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

  async register({ name, email, password }) {
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error("Există deja un cont cu acest email.");
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.authRepository.registerUserWithDefaultRole({
      name,
      email,
      passwordHash,
    });

    const token = this.signAccessToken(user);

    return {
      user: this.mapUserForClient(user),
      token,
    };
  }

  async login({ email, password }) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("Email sau parolă incorectă.");
    }

    const isValidPassword = await argon2.verify(user.passwordHash, password);
    if (!isValidPassword) {
      throw new Error("Email sau parolă incorectă.");
    }

    const token = this.signAccessToken(user);

    return {
      user: this.mapUserForClient(user),
      token,
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