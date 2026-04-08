export class CartRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  getOrCreateCart(userId) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  getCartWithItems(userId) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async addOrIncrementItem(cartId, productId, quantity, unitPriceRon) {
    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, productId, quantity, unitPriceRon },
    });
  }

  updateItemQuantity(itemId, cartId, quantity) {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  deleteItem(itemId) {
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  clearCart(cartId) {
    return this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}