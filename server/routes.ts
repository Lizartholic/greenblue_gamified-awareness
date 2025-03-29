import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes
  // Get user progress
  app.get("/api/user/progress", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user!.id;
    const progress = await storage.getUserProgress(userId);
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    
    res.json(progress);
  });
  
  // Get module progress
  app.get("/api/modules/:moduleId/progress", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { moduleId } = req.params;
    const userId = req.user!.id;
    const userProgress = await storage.getUserProgress(userId);
    
    if (!userProgress || !userProgress.modules[moduleId]) {
      return res.status(404).json({ message: "Module progress not found" });
    }
    
    res.json(userProgress.modules[moduleId]);
  });
  
  // Submit answer for phishing module
  app.post("/api/modules/phishing/submit", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const submitAnswerSchema = z.object({
      challengeId: z.number(),
      answer: z.string()
    });
    
    try {
      const { challengeId, answer } = submitAnswerSchema.parse(req.body);
      const userId = req.user!.id;
      
      // In a real app, you would check the answer against a database of challenges
      // For now, just assume any 'phishing' answer is correct (simplified)
      const isCorrect = answer === 'phishing';
      
      // Get current progress
      const userProgress = await storage.getUserProgress(userId);
      const currentProgress = userProgress?.modules.phishing || { progress: 0, score: 0, completedChallenges: [] };
      
      // Update progress
      const updatedProgress = await storage.updateUserProgress(userId, 'phishing', {
        score: currentProgress.score + (isCorrect ? 100 : 0),
        progress: Math.min(100, currentProgress.progress + 10),
        completedChallenges: [...currentProgress.completedChallenges, challengeId]
      });
      
      res.json({
        isCorrect,
        explanation: isCorrect ? 
          "Great job! This is indeed a phishing attempt. Notice the misspelled sender address and urgent language." :
          "This is actually a phishing attempt. Pay attention to the sender's email address which contains a '1' instead of an 'l'.",
        score: updatedProgress.modules.phishing.score,
        progress: updatedProgress.modules.phishing.progress
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  
  // Check password strength
  app.post("/api/modules/password/check", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const passwordSchema = z.object({
      password: z.string()
    });
    
    try {
      const { password } = passwordSchema.parse(req.body);
      
      // Password strength check
      const requirements = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        notCommon: password.length >= 8 && !/^(password|123456|qwerty)/.test(password)
      };
      
      // Calculate strength score (0-100)
      let strength = 0;
      if (requirements.length) strength += 20;
      if (requirements.uppercase) strength += 20;
      if (requirements.lowercase) strength += 20;
      if (requirements.number) strength += 20;
      if (requirements.special) strength += 20;
      
      // Determine text based on strength
      let strengthText = 'Very Weak';
      if (strength >= 80) strengthText = 'Very Strong';
      else if (strength >= 60) strengthText = 'Strong';
      else if (strength >= 40) strengthText = 'Moderate';
      else if (strength >= 20) strengthText = 'Weak';
      
      res.json({ strength, requirements, strengthText });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  
  // Submit password challenge
  app.post("/api/modules/password/submit", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const passwordSchema = z.object({
      password: z.string()
    });
    
    try {
      const { password } = passwordSchema.parse(req.body);
      const userId = req.user!.id;
      
      // Check password strength (repeated from above for simplicity)
      const requirements = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        notCommon: password.length >= 8 && !/^(password|123456|qwerty)/.test(password)
      };
      
      let strength = 0;
      if (requirements.length) strength += 20;
      if (requirements.uppercase) strength += 20;
      if (requirements.lowercase) strength += 20;
      if (requirements.number) strength += 20;
      if (requirements.special) strength += 20;
      
      const success = strength >= 80;
      
      // Get current progress
      const userProgress = await storage.getUserProgress(userId);
      const currentProgress = userProgress?.modules.password || { progress: 0, score: 0, completedChallenges: [] };
      
      if (success) {
        // Update progress only if strong enough
        await storage.updateUserProgress(userId, 'password', {
          score: currentProgress.score + 100,
          progress: Math.min(100, currentProgress.progress + 20),
          completedChallenges: [...currentProgress.completedChallenges, Date.now()]
        });
      }
      
      // Get updated progress
      const updatedProgress = await storage.getUserProgress(userId);
      
      res.json({
        success,
        score: updatedProgress?.modules.password.score,
        progress: updatedProgress?.modules.password.progress,
        message: success ? 
          'Excellent! Your password is very strong and follows best practices.' : 
          'Your password doesn\'t meet all the security requirements. Try making it stronger.'
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
