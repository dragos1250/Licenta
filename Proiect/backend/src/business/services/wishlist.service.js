export class WishlistService {
  constructor(wishlistRepo, prisma) {
    this.wishlistRepo = wishlistRepo;
    this.prisma = prisma;
  }

  mapWishlist(wishlist) {
    const items =
      wishlist?.items?.map((wi) => ({
        productId: wi.productId,
        createdAt: wi.createdAt,
        product: {
          id: wi.product.id,
          name: wi.product.name,
          brand: wi.product.brand,
          category: wi.product.category,
          imageUrl: wi.product.imageUrl,
          priceRon: wi.product.priceRon,
          originalPriceRon: wi.product.originalPriceRon ?? null,
          stock: wi.product.stock,
          rating: wi.product.rating ?? 0,
          reviews: wi.product.reviews ?? 0,
          badge: wi.product.badge ?? null,
        },
        inStock: wi.product.stock > 0,
      })) || [];

    const totalValueRon = items.reduce((s, it) => s + (it.product.priceRon || 0), 0);
    const inStockCount = items.filter((it) => it.inStock).length;

    return {
      name: wishlist?.name || "default",
      totalItems: items.length,
      inStockCount,
      totalValueRon,
      items,
    };
  }

  async getMyWishlist(userId) {
    await this.wishlistRepo.getOrCreateDefaultWishlist(userId);
    const wishlist = await this.wishlistRepo.getDefaultWishlistWithItems(userId);
    return this.mapWishlist(wishlist);
  }

  async addItem(userId, productId) {
    const wishlist = await this.wishlistRepo.getOrCreateDefaultWishlist(userId);

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Produs inexistent.");

    await this.wishlistRepo.createItem(wishlist.id, productId);

    return this.getMyWishlist(userId);
  }

  async removeItem(userId, productId) {
    const wishlist = await this.wishlistRepo.getOrCreateDefaultWishlist(userId);
    await this.wishlistRepo.deleteItem(wishlist.id, productId);
    return this.getMyWishlist(userId);
  }

  async clear(userId) {
    const wishlist = await this.wishlistRepo.getOrCreateDefaultWishlist(userId);
    await this.wishlistRepo.clear(wishlist.id);
    return this.getMyWishlist(userId);
  }

  async removeUnavailable(userId) {
    const wishlist = await this.wishlistRepo.getOrCreateDefaultWishlist(userId);
    await this.wishlistRepo.deleteUnavailable(wishlist.id);
    return this.getMyWishlist(userId);
  }

  async count(userId) {
    const wishlist = await this.wishlistRepo.getOrCreateDefaultWishlist(userId);
    const count = await this.wishlistRepo.countItems(wishlist.id);
    return { count };
  }
}