import { z } from 'zod';

const text = z.string();
const id = text.min(1);
const amount = z.number().finite().nonnegative();
const demoRecord = { id, isDemo: z.boolean() };
const strings = z.array(text);
const store = z.object({ ...demoRecord, slug: id, name: text, productId: id, productName: text, productImage: text, price: amount, compareAtPrice: amount, description: text, category: text, benefits: strings, status: z.enum(['live','draft','paused']), createdAt: text,
  branding: z.object({ storeName: text, slug: text, tagline: text, accentColor: text, visualStyle: z.enum(['minimal','premium','lifestyle']) }),
  content: z.object({ heroHeadline: text, heroSubheading: text, benefits: strings, highlights: strings, faqs: z.array(z.object({ question: text, answer: text })), ctaText: text }),
});
const order = z.object({ ...demoRecord, storeId: id, storeName: text, productId: id, quantity: z.number().int().positive(), unitPrice: amount, total: amount, status: z.enum(['completed','pending','refunded']), customerName: text.optional(), createdAt: text });
const traffic = z.object({ ...demoRecord, storeId: id, date: text, visitors: amount, productViews: amount, checkoutStarts: amount, adSpend: amount });
const transaction = z.object({ ...demoRecord, storeId: id, storeName: text, description: text, type: z.enum(['sale-credit','marketing-debit','operating-debit']), amount, status: z.enum(['settled','pending']), timestamp: text, orderId: text.nullable().optional(), category: text.optional() });
const activity = z.object({ ...demoRecord, storeId: text.optional(), eventType: z.enum(['product-discovered','store-created','creative-generated','order-completed','store-updated','store-deleted']), title: text, description: text, timestamp: text });
const creative = z.object({ ...demoRecord, productId: id, productName: text, platform: z.enum(['instagram','facebook','tiktok','pinterest']), format: z.enum(['static','carousel','video']), objective: text, audience: text, tone: text, headline: text, body: text, caption: text, callToAction: text, hooks: strings, headlineVariants: strings, storyboard: z.array(z.object({ id, time: text, shot: text, visual: text, onScreenText: text, audio: text })), videoPrompt: text, createdAt: text, provider: z.literal('Template (deterministic)').optional(), model: z.literal("template-v1").optional(), sourceProductId: text.optional(), source_product_id: text.optional(), created_at: text.optional() }).passthrough();

export const commerceSnapshotSchema = z.object({ stores: z.array(store), orders: z.array(order), traffic: z.array(traffic), transactions: z.array(transaction), activities: z.array(activity), creatives: z.array(creative), initialized: z.boolean().optional() });
export type CommerceSnapshot = z.infer<typeof commerceSnapshotSchema>;
