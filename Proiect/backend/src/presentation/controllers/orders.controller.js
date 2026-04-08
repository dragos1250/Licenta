export class OrdersController {
  constructor(ordersService) {
    this.ordersService = ordersService;
  }

  myOrders = async (req, res, next) => {
    try {
      const data = await this.ordersService.listMyOrders(req.auth.userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  myOrderById = async (req, res, next) => {
    try {
      const data = await this.ordersService.getMyOrder(req.params.id, req.auth.userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  checkout = async (req, res, next) => {
    try {
      const data = await this.ordersService.checkoutFromUserCart(req.auth.userId, req.body);
      res.status(201).json(data);
    } catch (e) {
      next(e);
    }
  };

  guestCheckout = async (req, res, next) => {
    try {
      const { items, ...rest } = req.body || {};
      const data = await this.ordersService.guestCheckout(items, rest);
      res.status(201).json(data);
    } catch (e) {
      next(e);
    }
  };
}