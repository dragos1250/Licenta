export class BuildsController {
  constructor(buildsService) {
    this.buildsService = buildsService;

    this.create = this.create.bind(this);
    this.listMine = this.listMine.bind(this);
    this.remove = this.remove.bind(this);
  }

  async create(req, res) {
    try {
      const userId = req.auth?.userId;

      const build = await this.buildsService.createBuild(userId, req.body);

      return res.status(201).json(build);
    } catch (error) {
      return res.status(error.status || 500).json({
        error: error.message || "Nu am putut salva build-ul.",
      });
    }
  }

  async listMine(req, res) {
    try {
      const userId = req.auth?.userId;

      const builds = await this.buildsService.getMyBuilds(userId);

      return res.status(200).json(builds);
    } catch (error) {
      return res.status(error.status || 500).json({
        error: error.message || "Nu am putut încărca build-urile.",
      });
    }
  }

  async remove(req, res) {
    try {
      const userId = req.auth?.userId;
      const buildId = req.params.id;

      const result = await this.buildsService.deleteBuild(userId, buildId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.status || 500).json({
        error: error.message || "Nu am putut șterge build-ul.",
      });
    }
  }
}