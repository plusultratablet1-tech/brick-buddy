# Brick Buddy Storefront Design

## Goal
Build a polished Shopify-style Brick Buddy Season 2 storefront that can be deployed independently to Vercel and later connected to persistent order data.

## V1 customer experience
The page is a responsive single-page storefront with: announcement bar, brand navigation, conversion-focused hero, product contents, four-step preorder flow, Surprise Buddy story, parent benefits, preorder form, order-status demo, FAQ, and legal footer.

## Brand and offer
- Headline: BRING • BUILD • BOND
- Product: Brick Buddy portable case with 12 colorful 2x4 building bricks, 6x10 plate, and Surprise Buddy character figure.
- Season 2 working price: ₱449.
- Reservation: ₱200, with ₱249 balance later.
- Initial preorder capacity displayed as 10 slots.
- Positioning: portable, screen-free creative play and parent-child bonding.

## Visual direction
Use a modern Shopify-style ecommerce layout: white and warm cream surfaces, strong black typography, yellow brand accents, soft shadows, rounded product cards, prominent conversion buttons, and responsive mobile stacking.

## Architecture
Use Next.js App Router with TypeScript. Keep V1 data local and dependency-light. Interactive preorder and tracking shells run client-side; persistence, Supabase, admin tools, and payment integration are later phases.

## Legal/safety
Do not present Brick Buddy as officially affiliated with another toy brand. Footer includes an independent-brand disclaimer and a small-parts warning.
