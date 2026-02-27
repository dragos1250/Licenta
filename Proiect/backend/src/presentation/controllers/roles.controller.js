import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export class RolesController {
  constructor(rolesService) {
    this.rolesService = rolesService;
  }

  createRole = async (req, res, next) => {
    try {
      const parsed = createRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide",
          details: parsed.error.issues,
        });
      }

      const result = await this.rolesService.createRole(parsed.data);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  getRoles = async (req, res, next) => {
    try {
      const result = await this.rolesService.getRoles();
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };
}