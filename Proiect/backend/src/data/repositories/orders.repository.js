export class OrdersRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // --- cart for checkout (user) ---
  getCartForUser(userId) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  clearCart(cartId, tx = this.prisma) {
    return tx.cartItem.deleteMany({ where: { cartId } });
  }

  decrementProductStock(productId, qty, tx = this.prisma) {
    return tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: qty } },
    });
  }

  // --- order persistence ---
  createOrder(data, tx = this.prisma) {
    return tx.order.create(data);
  }

  // --- guest products lookup ---
  findProductsByIds(ids) {
    return this.prisma.product.findMany({
      where: { id: { in: ids } },
    });
  }

  // --- read ---
  listMyOrders(userId) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  getMyOrder(orderId, userId) {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
  }
}