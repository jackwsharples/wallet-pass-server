import { Express, Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { getPrisma } from './lib/prisma.js';

const prisma = getPrisma();

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

      // The frontend uses the implicit OAuth flow (custom-styled button), which
      // yields an ACCESS token, not an ID token. Validate it with Google's
      // tokeninfo endpoint (and confirm it was issued for this app), then fetch
      // the user's profile.
      let profile: { sub?: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
      try {
        const infoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`
        );
        if (!infoRes.ok) throw new Error('Token rejected by Google');
        const info = (await infoRes.json()) as { aud?: string };
        if (info.aud !== process.env.GOOGLE_CLIENT_ID) {
          throw new Error('Token was not issued for this app');
        }

        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error('Failed to fetch Google profile');
        profile = await userRes.json();
      } catch (error: any) {
        console.error('Google token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid Google token' });
      }

      if (!profile.email || !profile.sub) {
        return res.status(401).json({ error: 'Invalid token payload' });
      }
      if (profile.email_verified === false) {
        return res.status(401).json({ error: 'Google account email is not verified' });
      }

      const { sub: googleId, email, name, picture } = profile;

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

      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET not configured');
      }

      const sessionToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN || '7d',
        } as SignOptions
      );

      res.json({
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          role: user.role,
          createdAt: user.createdAt,
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
        select: { id: true, email: true, name: true, profilePicture: true, role: true, createdAt: true },
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
