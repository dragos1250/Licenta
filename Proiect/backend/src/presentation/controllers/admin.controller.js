export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  listOrders = async (req, res, next) => {
    try {
      const data = await this.adminService.listOrders();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  listUsers = async (req, res, next) => {
    try {
      const data = await this.adminService.listUsers();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  };

  listProducts = async (req, res, next) => {
    try {
      const data = await this.adminService.listProducts();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  };
}