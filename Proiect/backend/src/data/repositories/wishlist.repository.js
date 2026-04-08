export class WishlistRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  getOrCreateDefaultWishlist(userId) {
    return this.prisma.wishlist.upsert({
      where: { userId_name: { userId, name: "default" } },
      update: {},
      create: { userId, name: "default" },
    });
  }

  getDefaultWishlistWithItems(userId) {
    return this.prisma.wishlist.findUnique({
      where: { userId_name: { userId, name: "default" } },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  createItem(wishlistId, productId) {
    return this.prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId, productId } },
      update: {},
      create: { wishlistId, productId },
    });
  }

  deleteItem(wishlistId, productId) {
    return this.prisma.wishlistItem.deleteMany({
      where: { wishlistId, productId },
    });
  }

  clear(wishlistId) {
    return this.prisma.wishlistItem.deleteMany({
      where: { wishlistId },
    });
  }

  deleteUnavailable(wishlistId) {
    return this.prisma.wishlistItem.deleteMany({
      where: {
        wishlistId,
        product: { stock: { lte: 0 } },
      },
    });
  }

  countItems(wishlistId) {
    return this.prisma.wishlistItem.count({ where: { wishlistId } });
  }
}