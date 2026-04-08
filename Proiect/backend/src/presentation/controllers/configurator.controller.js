export class ConfiguratorController {
  constructor(configuratorService) {
    this.configuratorService = configuratorService;

    this.checkCompatibility = this.checkCompatibility.bind(this);
    this.getCompatibleOptions = this.getCompatibleOptions.bind(this);
  }

  async checkCompatibility(req, res) {
    try {
      const selected = req.body?.selected || {};
      const result = await this.configuratorService.validateConfiguration(selected);

      return res.status(200).json(result);
    } catch (error) {
      console.error("ConfiguratorController.checkCompatibility error:", error);
      return res.status(500).json({
        message: "Nu am putut verifica compatibilitatea configurației.",
      });
    }
  }

  async getCompatibleOptions(req, res) {
    try {
      const { slotId } = req.params;
      const selected = req.body?.selected || {};

      const products = await this.configuratorService.getCompatibleProductsForSlot(
        slotId,
        selected
      );

      return res.status(200).json(products);
    } catch (error) {
      console.error("ConfiguratorController.getCompatibleOptions error:", error);
      return res.status(500).json({
        message: "Nu am putut încărca produsele compatibile.",
      });
    }
  }
}