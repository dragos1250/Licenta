import argon2 from "argon2";

function toNullableString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function parseDateOnly(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Data nașterii este invalidă.");
  }

  return parsed;
}

function mapProfile(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    userRoles: Array.isArray(user.userRoles) ? user.userRoles : [],
  };
}

function mapAddress(address) {
  return {
    id: address.id,
    userId: address.userId,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    country: address.country,
    county: address.county,
    city: address.city,
    street: address.street,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

export class UsersService {
  constructor(usersRepository, rolesRepository) {
    this.usersRepository = usersRepository;
    this.rolesRepository = rolesRepository;
  }

  async createUser({ email, password, name }) {
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new Error("Există deja un utilizator cu acest email.");
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.usersRepository.createUser({
      email,
      name,
      passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  async getUsers() {
    const users = await this.usersRepository.getAll();

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      dateOfBirth: u.dateOfBirth
        ? u.dateOfBirth.toISOString().slice(0, 10)
        : null,
      createdAt: u.createdAt,
      roles: u.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
    }));
  }

  async assignRole(userId, roleId) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new Error("Utilizatorul nu există.");

    const role = await this.rolesRepository.findById(roleId);
    if (!role) throw new Error("Rolul nu există.");

    try {
      await this.usersRepository.assignRoleToUser(userId, roleId);
    } catch {
      throw new Error("Rolul este deja asignat utilizatorului.");
    }

    return { message: "Rol asignat cu succes." };
  }

  async getMyProfile(userId) {
    const user = await this.usersRepository.findProfileById(userId);

    if (!user) {
      throw new Error("Utilizatorul nu există.");
    }

    return mapProfile(user);
  }

  async updateMyProfile(userId, data) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new Error("Utilizatorul nu există.");
    }

    const nextEmail =
      data.email !== undefined ? String(data.email).trim() : undefined;

    if (nextEmail && nextEmail !== user.email) {
      const existing = await this.usersRepository.findByEmail(nextEmail);
      if (existing && existing.id !== userId) {
        throw new Error("Există deja un utilizator cu acest email.");
      }
    }

    const updated = await this.usersRepository.updateProfile(userId, {
      ...(data.name !== undefined ? { name: String(data.name).trim() } : {}),
      ...(nextEmail !== undefined ? { email: nextEmail } : {}),
      ...(data.phone !== undefined ? { phone: toNullableString(data.phone) } : {}),
      ...(data.dateOfBirth !== undefined
        ? { dateOfBirth: parseDateOnly(data.dateOfBirth) }
        : {}),
    });

    return mapProfile(updated);
  }

  async getMyAddresses(userId) {
    const addresses = await this.usersRepository.findAddressesByUserId(userId);
    return addresses.map(mapAddress);
  }

  async createMyAddress(userId, data) {
    const created = await this.usersRepository.createAddressForUser({
      userId,
      label: String(data.label).trim(),
      recipientName: toNullableString(data.recipientName),
      phone: toNullableString(data.phone),
      country: data.country ? String(data.country).trim() : "RO",
      county: String(data.county).trim(),
      city: String(data.city).trim(),
      street: String(data.street).trim(),
      postalCode: toNullableString(data.postalCode),
      isDefault: Boolean(data.isDefault),
    });

    return mapAddress(created);
  }

  async updateMyAddress(userId, addressId, data) {
    const updated = await this.usersRepository.updateAddressForUser(
      userId,
      addressId,
      {
        ...(data.label !== undefined ? { label: String(data.label).trim() } : {}),
        ...(data.recipientName !== undefined
          ? { recipientName: toNullableString(data.recipientName) }
          : {}),
        ...(data.phone !== undefined ? { phone: toNullableString(data.phone) } : {}),
        ...(data.country !== undefined
          ? { country: String(data.country).trim() }
          : {}),
        ...(data.county !== undefined
          ? { county: String(data.county).trim() }
          : {}),
        ...(data.city !== undefined ? { city: String(data.city).trim() } : {}),
        ...(data.street !== undefined
          ? { street: String(data.street).trim() }
          : {}),
        ...(data.postalCode !== undefined
          ? { postalCode: toNullableString(data.postalCode) }
          : {}),
        ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
      }
    );

    if (!updated) {
      throw new Error("Adresa nu a fost găsită.");
    }

    return mapAddress(updated);
  }

  async setDefaultAddress(userId, addressId) {
    const updated = await this.usersRepository.setDefaultAddressForUser(
      userId,
      addressId
    );

    if (!updated) {
      throw new Error("Adresa nu a fost găsită.");
    }

    return mapAddress(updated);
  }

  async deleteMyAddress(userId, addressId) {
    const deleted = await this.usersRepository.deleteAddressForUser(
      userId,
      addressId
    );

    if (!deleted) {
      throw new Error("Adresa nu a fost găsită.");
    }

    return { message: "Adresa a fost ștearsă cu succes." };
  }
}