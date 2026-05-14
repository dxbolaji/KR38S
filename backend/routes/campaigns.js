/**
 * backend/routes/campaigns.js
 *
 * Campaign endpoints.
 *
 * Public:
 *   GET  /campaigns         — list all active campaigns
 *   GET  /campaigns/:id     — get single campaign + ledger entries
 *
 * Protected (requires Supabase JWT):
 *   POST /campaigns         — create campaign + provisions Squad virtual account
 *
 * Consumers: server.js
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncWrap, createError } from '../middleware/errorHandler.js';
import {
  createCampaign,
  listCampaigns,
  getCampaignById,
} from '../services/campaignService.js';

const router = Router();

// ─── GET /campaigns ───────────────────────────────────────────────────────────

router.get(
  '/',
  asyncWrap(async (req, res) => {
    const limit    = Math.min(Number(req.query.limit) || 20, 100);
    const offset   = Number(req.query.offset) || 0;
    const category = req.query.category || undefined;

    const campaigns = await listCampaigns({ limit, offset, category });

    res.json({ success: true, data: campaigns });
  })
);

// ─── GET /campaigns/:id ───────────────────────────────────────────────────────

router.get(
  '/:id',
  asyncWrap(async (req, res) => {
    const campaign = await getCampaignById(req.params.id);
    res.json({ success: true, data: campaign });
  })
);

// ─── POST /campaigns ──────────────────────────────────────────────────────────

router.post(
  '/',
  requireAuth,
  asyncWrap(async (req, res) => {
    const {
      name,
      org,
      category,
      description,
      goalNgn,
      endDate,
      socialLink,
      beneficiaryBankCode,
      beneficiaryAccountNo,
      walletAddress,
    } = req.body;

    // Input validation
    if (!name || !org || !description || !goalNgn || !beneficiaryBankCode || !beneficiaryAccountNo) {
      throw createError(
        'Missing required fields: name, org, description, goalNgn, beneficiaryBankCode, beneficiaryAccountNo',
        400
      );
    }

    if (typeof goalNgn !== 'number' || goalNgn <= 0) {
      throw createError('goalNgn must be a positive number', 400);
    }

    const campaign = await createCampaign({
      ownerId: req.user.id,
      name: name.trim(),
      org: org.trim(),
      category: category || 'other',
      description: description.trim(),
      goalNgn,
      endDate: endDate || null,
      socialLink: socialLink || null,
      beneficiaryBankCode,
      beneficiaryAccountNo,
      walletAddress: walletAddress || null,
    });

    res.status(201).json({ success: true, data: campaign });
  })
);

export default router;
