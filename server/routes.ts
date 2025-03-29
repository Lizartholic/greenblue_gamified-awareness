import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Game modules routes
  app.get("/api/modules", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/modules/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const moduleId = parseInt(req.params.id);
      const module = await storage.getModuleById(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      res.json(module);
    } catch (error) {
      next(error);
    }
  });

  // User progress routes
  app.get("/api/progress", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/progress/:moduleId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const moduleId = parseInt(req.params.moduleId);
      const progress = await storage.getUserProgressByModule(userId, moduleId);
      
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/progress/:moduleId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const moduleId = parseInt(req.params.moduleId);
      const { completedChallenges, points, timeSpent, isCompleted } = req.body;
      
      // Find existing progress
      let progress = await storage.getUserProgressByModule(userId, moduleId);
      
      if (!progress) {
        // Create new progress if it doesn't exist
        progress = await storage.createUserProgress({
          userId,
          moduleId,
          completedChallenges: completedChallenges || 0,
          points: points || 0,
          timeSpent: timeSpent || 0,
          isCompleted: isCompleted || false
        });
      } else {
        // Update existing progress
        progress = await storage.updateUserProgress(progress.id, {
          completedChallenges: completedChallenges !== undefined ? completedChallenges : progress.completedChallenges,
          points: points !== undefined ? points : progress.points,
          timeSpent: timeSpent !== undefined ? timeSpent : progress.timeSpent,
          isCompleted: isCompleted !== undefined ? isCompleted : progress.isCompleted
        });
      }
      
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
