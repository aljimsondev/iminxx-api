import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import parseForwarded from 'forwarded-parse';
/**
 * General API rate limiter - 100 requests per 15 minutes per IP
 */

const NUMBER_OF_PROXIES_TO_TRUST = 1;

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/ping';
  },
  validate: {
    xForwardedForHeader: false,
  },
  keyGenerator: (req, res) => {
    let ip = req.ip;
    try {
      const forwards = parseForwarded(req.headers.forwarded!);
      ip = forwards[forwards.length - NUMBER_OF_PROXIES_TO_TRUST].for;
    } catch (ex) {
      console.error(
        `Error parsing Forwarded header ${req.headers.forwarded} from ${req.ip}:`,
        ex,
      );
    }
    return ipKeyGenerator(ip!);
  },
});
