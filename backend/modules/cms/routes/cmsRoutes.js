import express from 'express';
import { getLandingPageConfig, updateLandingPageConfig } from '../controllers/cmsController.js';
import { protect, authorizedRoles } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to fetch configuration
router.get('/landing-page', getLandingPageConfig);

// Protected route for CMS admin
// Using superadmin or a new cms_admin role for now. Assuming superadmin has access.
router.put('/landing-page', protect, authorizedRoles('superadmin', 'cms_admin'), updateLandingPageConfig);

export default router;
