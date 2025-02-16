import rateLimit from "express-rate-limit";

const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT || 5,
  handler: (req, res) => {
    res.status(429).json({
      error: `Limite de ${process.env.RATE_LIMIT} requêtes/minute atteinte`
    });
  }
});

export default rateLimitMiddleware;