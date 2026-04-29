import { z } from "zod";

const recentMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().max(3000),
});

const currentBuildItemSchema = z.object({
  productId: z.string().trim().min(1),
  slotKey: z.string().trim().optional(),
  slotLabel: z.string().trim().optional(),
});

const currentBuildSchema = z.object({
  items: z.array(currentBuildItemSchema).max(40).optional(),
});

const assistantContextSchema = z.object({
  currentBuild: currentBuildSchema.optional(),
  recentMessages: z.array(recentMessageSchema).max(10).optional(),
});

const buildAssistantSchema = z.object({
  message: z
    .string()
    .trim()
    .min(5, "Mesajul trebuie să aibă minim 5 caractere.")
    .max(2000, "Mesajul este prea lung."),
  context: assistantContextSchema.optional(),
});

export class AiController {
  constructor(aiService) {
    this.aiService = aiService;
  }

  usage = async (req, res, next) => {
    try {
      const usage = await this.aiService.getUsageStatus(req.auth);

      return res.json(usage);
    } catch (err) {
      next(err);
    }
  };

  buildAssistant = async (req, res, next) => {
    try {
      const parsed = buildAssistantSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Date invalide.",
          details: parsed.error.issues,
        });
      }

      const data = await this.aiService.buildAssistant({
        auth: req.auth,
        message: parsed.data.message,
        context: parsed.data.context || {},
      });

      return res.json(data);
    } catch (err) {
      if (err.status === 429) {
        return res.status(429).json({
          error: err.message,
          usage: err.usage,
        });
      }

      next(err);
    }
  };
}
