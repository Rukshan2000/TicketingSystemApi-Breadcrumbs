const SystemsModel = require('../models/Systems');

class SystemsController {
  static async createSystem(req, res) {
    try {
      const system = req.body;

      // Validate required fields
      const requiredFields = ['system_name'];

      for (const field of requiredFields) {
        if (!(field in system) || system[field] === undefined || system[field] === null || system[field] === '') {
          res.status(400).json({ error: `Missing required field: ${field}` });
          return;
        }
      }

      // Map responsible_person_ids to responsible_person if provided
      if (system.responsible_person_ids) {
        system.responsible_person = system.responsible_person_ids;
        delete system.responsible_person_ids;
      }

      // Map customers_ids to customers if provided
      if (system.customers_ids) {
        system.customers = system.customers_ids;
        delete system.customers_ids;
      }

      const newSystem = await SystemsModel.create(system);
      res.status(201).json({ success: true, data: newSystem });
    } catch (error) {
      console.error('Error in createSystem:', error.message);
      console.error('Error details:', error);
      res.status(500).json({ error: 'Failed to create system', details: error.message });
    }
  }

  static async getSystemById(req, res) {
    try {
      const { id } = req.params;
      const system = await SystemsModel.findById(parseInt(id, 10));

      if (!system) {
        res.status(404).json({ error: 'System not found' });
        return;
      }

      res.status(200).json({ success: true, data: system });
    } catch (error) {
      console.error('Error in getSystemById:', error);
      res.status(500).json({ error: 'Failed to get system' });
    }
  }

  static async getAllSystems(req, res) {
    try {
      const systems = await SystemsModel.findAll();
      res.status(200).json({ success: true, data: systems });
    } catch (error) {
      console.error('Error in getAllSystems:', error);
      res.status(500).json({ error: 'Failed to get systems' });
    }
  }

  static async updateSystem(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Map responsible_person_ids to responsible_person if provided
      if (updates.responsible_person_ids) {
        updates.responsible_person = updates.responsible_person_ids;
        delete updates.responsible_person_ids;
      }

      // Map customers_ids to customers if provided
      if (updates.customers_ids) {
        updates.customers = updates.customers_ids;
        delete updates.customers_ids;
      }

      const updatedSystem = await SystemsModel.update(parseInt(id, 10), updates);

      if (!updatedSystem) {
        res.status(404).json({ error: 'System not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedSystem });
    } catch (error) {
      console.error('Error in updateSystem:', error);
      res.status(500).json({ error: 'Failed to update system' });
    }
  }

  static async deleteSystem(req, res) {
    try {
      const { id } = req.params;
      const deleted = await SystemsModel.delete(parseInt(id, 10));

      if (!deleted) {
        res.status(404).json({ error: 'System not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'System deleted successfully' });
    } catch (error) {
      console.error('Error in deleteSystem:', error);
      res.status(500).json({ error: 'Failed to delete system' });
    }
  }
}

module.exports = SystemsController;