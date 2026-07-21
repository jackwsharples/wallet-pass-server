import { Express, Request, Response, NextFunction } from 'express'
import { getPrisma } from './lib/prisma.js'
import { generateCode } from './discount-routes.js'

const prisma = getPrisma()

interface AdminRequest extends Request {
  user?: { id: string; email: string }
}

export function registerAdminRoutes(app: Express) {
  app.post('/api/admin/test-checkout', async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const allowBypass = process.env.ALLOW_ADMIN_BYPASS === 'true' || process.env.NODE_ENV !== 'production'
      if (!allowBypass) {
        return res.status(403).json({ error: 'Admin bypass not enabled' })
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      })

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' })
      }

      const { metadata, email: customerEmail, regionId, regionName } = req.body || {}

      if (!regionId || typeof regionId !== 'string') {
        return res.status(400).json({ error: 'Missing regionId' })
      }

      // Write to DiscountCode — the table /api/redeem-code reads — so test codes
      // behave exactly like paid ones, region metadata included
      let code = ''
      for (let i = 0; i < 5; i++) {
        const candidate = generateCode(12)
        try {
          await prisma.discountCode.create({
            data: {
              code: candidate,
              stripeSessionId: `admin-test:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
              email: (customerEmail || user.email || '').toLowerCase() || null,
              status: 'UNUSED',
              metadata: {
                ...metadata,
                region: regionId,
                ...(typeof regionName === 'string' && regionName ? { regionName } : {}),
                adminBypass: true,
                adminId: user.id,
                testMode: true,
              },
            },
          })
          code = candidate
          break
        } catch (e: any) {
          if (e?.code !== 'P2002') throw e
        }
      }

      if (!code) {
        return res.status(500).json({ error: 'Failed to create test code' })
      }

      res.json({
        code,
        message: 'Admin test mode: Code generated without Stripe charge',
        isTestMode: true,
      })
    } catch (err) {
      next(err)
    }
  })

  app.post('/api/admin/promote-user', async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const allowBypass = process.env.ALLOW_ADMIN_BYPASS === 'true' || process.env.NODE_ENV !== 'production'
      if (!allowBypass) {
        return res.status(403).json({ error: 'Admin operations disabled' })
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const requester = await prisma.user.findUnique({
        where: { id: req.user.id },
      })

      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' })
      }

      const { userId } = req.body || {}

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing userId' })
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: 'admin' },
      })

      res.json({
        message: 'User promoted to admin',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      })
    } catch (err) {
      next(err)
    }
  })

  app.post('/api/admin/demote-user', async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const allowBypass = process.env.ALLOW_ADMIN_BYPASS === 'true' || process.env.NODE_ENV !== 'production'
      if (!allowBypass) {
        return res.status(403).json({ error: 'Admin operations disabled' })
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const requester = await prisma.user.findUnique({
        where: { id: req.user.id },
      })

      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' })
      }

      const { userId } = req.body || {}

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing userId' })
      }

      if (userId === req.user.id) {
        return res.status(400).json({ error: 'Cannot demote yourself' })
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: 'user' },
      })

      res.json({
        message: 'User demoted to regular user',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      })
    } catch (err) {
      next(err)
    }
  })
}
