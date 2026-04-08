import { prisma } from "../../data/prismaClient.js";

export async function requireAdmin(req, res, next) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Neautentificat.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Utilizator inexistent.",
      });
    }

    const isAdmin = (user.userRoles || []).some((ur) => {
      const roleName = ur?.role?.name || "";
      return String(roleName).trim().toLowerCase() === "admin";
    });

    if (!isAdmin) {
      return res.status(403).json({
        error: "Acces interzis. Este necesar rolul de admin.",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}