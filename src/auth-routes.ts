import { Express, Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { getPrisma } from './lib/prisma.js';

const prisma = getPrisma();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleToken {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export function registerAuthRoutes(app: Express) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  app.post('/api/auth/google', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid token' });
      }

      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'Google OAuth not configured' });
      }

      let ticket;
      try {
        ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
      } catch (error: any) {
        console.error('Google token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid Google token' });
      }

      const payload = ticket.getPayload() as GoogleToken | undefined;

      if (!payload || !payload.email || !payload.sub) {
        return res.status(401).json({ error: 'Invalid token payload' });
      }

      const { sub: googleId, email, name, picture } = payload;

      let user = await prisma.user.findUnique({
        where: { googleId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId,
            email,
            name: name || undefined,
            profilePicture: picture || undefined,
          },
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: name || user.name,
            profilePicture: picture || user.profilePicture,
            updatedAt: new Date(),
          },
        });
      }

      const sessionToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
        JWT_SECRET as string,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/auth/me', verifySessionToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, profilePicture: true, role: true },
      });
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.json({ success: true });
  });
}

export function verifySessionToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name?: string };
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    return next();
  }
}
