export class CartService {
  constructor(cartRepo, prisma) {
    this.cartRepo = cartRepo;
    this.prisma = prisma;
  }

  calcTotals(items) {
    const subtotal = items.reduce(
      (sum, it) => sum + it.unitPriceRon * it.quantity,
      0
    );
    const tva = Math.round(subtotal * 0.21);
    const shipping = subtotal >= 500 ? 0 : 25; // exemplu regulă
    const total = subtotal + tva + shipping;

    return { subtotalRon: subtotal, tvaRon: tva, shippingRon: shipping, totalRon: total };
  }

  async getCart(userId) {
    await this.cartRepo.getOrCreateCart(userId);
    const cart = await this.cartRepo.getCartWithItems(userId);

    const items = (cart?.items || []).map((ci) => ({
      id: ci.id,
      quantity: ci.quantity,
      unitPriceRon: ci.unitPriceRon,
      product: {
        id: ci.product.id,
        name: ci.product.name,
        brand: ci.product.brand,
        category: ci.product.category,
        imageUrl: ci.product.imageUrl,
        priceRon: ci.product.priceRon,
      },
      lineTotalRon: ci.unitPriceRon * ci.quantity,
    }));

    const totals = this.calcTotals(items);

    return { items, ...totals };
  }

  async addItem(userId, productId, quantity) {
    const cart = await this.cartRepo.getOrCreateCart(userId);

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Produs inexistent.");
    if (quantity < 1) throw new Error("Cantitate invalidă.");
    if (product.stock < quantity) throw new Error("Stoc insuficient.");

    await this.cartRepo.addOrIncrementItem(cart.id, productId, quantity, product.priceRon);
    return this.getCart(userId);
  }

  async updateQuantity(userId, itemId, quantity) {
    if (quantity < 1) throw new Error("Cantitate invalidă.");

    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Cart inexistent.");

    // verifică dacă item aparține cart-ului userului
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) throw new Error("Item invalid.");

    await this.cartRepo.updateItemQuantity(itemId, cart.id, quantity);
    return this.getCart(userId);
  }

  async removeItem(userId, itemId) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Cart inexistent.");

    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) throw new Error("Item invalid.");

    await this.cartRepo.deleteItem(itemId);
    return this.getCart(userId);
  }

  async clear(userId) {
    const cart = await this.cartRepo.getOrCreateCart(userId);
    await this.cartRepo.clearCart(cart.id);
    return this.getCart(userId);
  }
}