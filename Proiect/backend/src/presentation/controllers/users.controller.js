import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

const assignRoleSchema = z.object({
  roleId: z.number().int().positive(),
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

      const result = await this.usersService.assignRole(userId, parsed.data.roleId);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };
}