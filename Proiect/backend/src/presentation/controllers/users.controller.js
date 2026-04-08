import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

const assignRoleSchema = z.object({
  roleId: z.number().int().positive(),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(6).max(30).optional().nullable(),
  dateOfBirth: z.string().trim().optional().nullable(),
});

const createAddressSchema = z.object({
  label: z.string().trim().min(1).max(50),
  recipientName: z.string().trim().min(2).max(120).optional().nullable(),
  phone: z.string().trim().min(6).max(30).optional().nullable(),
  country: z.string().trim().min(2).max(10).optional(),
  county: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  street: z.string().trim().min(1).max(200),
  postalCode: z.string().trim().max(20).optional().nullable(),
  isDefault: z.boolean().optional(),
});

const updateAddressSchema = z.object({
  label: z.string().trim().min(1).max(50).optional(),
  recipientName: z.string().trim().min(2).max(120).optional().nullable(),
  phone: z.string().trim().min(6).max(30).optional().nullable(),
  country: z.string().trim().min(2).max(10).optional(),
  county: z.string().trim().min(1).max(100).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  street: z.string().trim().min(1).max(200).optional(),
  postalCode: z.string().trim().max(20).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
  }

  createUser = async (req, res, next) => {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide",
          details: parsed.error.issues,
        });
      }

      const result = await this.usersService.createUser(parsed.data);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  getUsers = async (req, res, next) => {
    try {
      const result = await this.usersService.getUsers();
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  assignRole = async (req, res, next) => {
    try {
      const userId = req.params.userId;

      const parsed = assignRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide",
          details: parsed.error.issues,
        });
      }

      const result = await this.usersService.assignRole(
        userId,
        parsed.data.roleId
      );
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getMyProfile = async (req, res, next) => {
    try {
      const userId = req.auth?.userId;
      const result = await this.usersService.getMyProfile(userId);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  updateMyProfile = async (req, res, next) => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide",
          details: parsed.error.issues,
        });
      }

      const userId = req.auth?.userId;
      const result = await this.usersService.updateMyProfile(userId, parsed.data);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getMyAddresses = async (req, res, next) => {
    try {
      const userId = req.auth?.userId;
      const result = await this.usersService.getMyAddresses(userId);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  createMyAddress = async (req, res, next) => {
    try {
      const parsed = createAddressSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide",
          details: parsed.error.issues,
        });
      }

      const userId = req.auth?.userId;
      const result = await this.usersService.createMyAddress(userId, parsed.data);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  updateMyAddress = async (req, res, next) => {
    try {
      const parsed = updateAddressSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide",
          details: parsed.error.issues,
        });
      }

      const userId = req.auth?.userId;
      const addressId = req.params.addressId;

      const result = await this.usersService.updateMyAddress(
        userId,
        addressId,
        parsed.data
      );

      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  setDefaultAddress = async (req, res, next) => {
    try {
      const userId = req.auth?.userId;
      const addressId = req.params.addressId;

      const result = await this.usersService.setDefaultAddress(userId, addressId);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteMyAddress = async (req, res, next) => {
    try {
      const userId = req.auth?.userId;
      const addressId = req.params.addressId;

      const result = await this.usersService.deleteMyAddress(userId, addressId);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };
}