/**
 * ===========================================
 * IMPORT CEREMONY CATALOG (One-time / Idempotent)
 * ===========================================
 *
 * Reads from: /data/ceremonies.json
 * Inserts/updates Categories and Services in MongoDB.
 *
 * Why:
 * - You asked to have a full ceremony catalog in the backend DB.
 * - No hardcoded demo data in frontend.
 * - Safe to re-run: uses upserts (won't duplicate).
 *
 * Usage:
 *   cd backend
 *   node scripts/importCeremonyCatalog.js
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const Category = require('../models/Category');
const Service = require('../models/Service');

async function run() {
  const filePath = path.join(__dirname, '..', '..', 'data', 'ceremonies.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Catalog file not found at:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const catalog = JSON.parse(raw);

  const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
  const services = Array.isArray(catalog.services) ? catalog.services : [];

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI missing in environment (.env)');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // 1) Upsert categories
  const categoryIdBySlug = new Map();

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    if (!c || !c.slug || !c.name) continue;

    const doc = await Category.findOneAndUpdate(
      { slug: String(c.slug).toLowerCase() },
      {
        $set: {
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          icon: c.icon || '🙏',
          isActive: true,
          parent: null,
          displayOrder: i
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    categoryIdBySlug.set(String(c.slug).toLowerCase(), doc._id);
  }

  console.log('✅ Categories imported:', categoryIdBySlug.size);

  // 2) Upsert services
  let serviceCount = 0;

  for (let j = 0; j < services.length; j++) {
    const s = services[j];
    if (!s || !s.slug || !s.name || !s.categorySlug) continue;

    const catId = categoryIdBySlug.get(String(s.categorySlug).toLowerCase());
    if (!catId) continue;

    const durationMin = Array.isArray(s.typicalDurationHours) ? Number(s.typicalDurationHours[0] || 1) : 1;
    const durationMax = Array.isArray(s.typicalDurationHours) ? Number(s.typicalDurationHours[1] || durationMin) : durationMin;

    await Service.findOneAndUpdate(
      { slug: String(s.slug).toLowerCase() },
      {
        $set: {
          name: s.name,
          slug: s.slug,
          category: catId,
          description: s.description || '',
          icon: s.icon || '🙏',
          duration: { min: durationMin, max: durationMax },
          // Price left empty; can be set later via admin/pricing rules.
          price: { min: null, max: null },
          tags: Array.isArray(s.tags) ? s.tags : [],
          isActive: true,
          isFeatured: false,
          isPopular: false,
          displayOrder: j,
          availableCities: ['Chennai'],
          availableModes: ['at_customer']
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    serviceCount++;
  }

  console.log('✅ Services imported:', serviceCount);

  // Update service counts per category
  const allCats = await Category.find({});
  for (const c of allCats) {
    await Category.updateServiceCount(c._id);
  }

  console.log('✅ Category service counts updated');
  await mongoose.disconnect();
  console.log('✅ Done');
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Import failed:', e);
  process.exit(1);
});
