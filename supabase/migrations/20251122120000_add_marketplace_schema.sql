/*
  # Marketplace Schema

  Adds tables and views to support the MarAI NFT marketplace experience:
    - marketplace_listings: off-chain metadata for evolving NFTs and sale params
    - marketplace_auctions: reserve auction metadata tied to listings
    - marketplace_auction_snapshots: historical snapshots mirroring on-chain state
    - marketplace_bids: bid ledger for each auction
    - marketplace_listings_view: convenience view of live listing + latest auction state
    - marketplace_bid_history_view: denormalized bid records scoped by token id
*/

-- Ensure uuid extension is present for deterministic defaults
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to refresh updated_at timestamp columns
CREATE OR REPLACE FUNCTION marketplace_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- MARKETPLACE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id numeric(78, 0) NOT NULL,
  contract_address text NOT NULL,
  creator_address text NOT NULL,
  owner_address text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'settled', 'cancelled')),
  sale_type text DEFAULT 'reserve_auction' CHECK (sale_type IN ('reserve_auction', 'buy_now', 'hybrid')),
  reserve_price_wei numeric(78, 0),
  buy_now_price_wei numeric(78, 0),
  currency_address text DEFAULT '0x0000000000000000000000000000000000000000',
  start_time timestamptz,
  end_time timestamptz,
  metadata_uri text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (token_id, contract_address)
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketplace listings are readable by all authenticated users"
  ON marketplace_listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators manage their own marketplace listings"
  ON marketplace_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their own marketplace listings"
  ON marketplace_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can cancel their own marketplace listings"
  ON marketplace_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_token ON marketplace_listings(token_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_creator ON marketplace_listings(created_by);

DROP TRIGGER IF EXISTS trg_marketplace_listings_touch ON marketplace_listings;
CREATE TRIGGER trg_marketplace_listings_touch
  BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION marketplace_touch_updated_at();

-- MARKETPLACE AUCTIONS TABLE
CREATE TABLE IF NOT EXISTS marketplace_auctions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid REFERENCES marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  auction_address text NOT NULL,
  factory_address text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'finalized', 'cancelled')),
  reserve_price_wei numeric(78, 0),
  highest_bid_wei numeric(78, 0),
  highest_bidder_address text,
  bid_count integer DEFAULT 0,
  start_block bigint,
  end_block bigint,
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_auctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketplace auctions are readable by all authenticated users"
  ON marketplace_auctions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators seed their own auctions"
  ON marketplace_auctions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators update their own auctions"
  ON marketplace_auctions FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators cancel their own auctions"
  ON marketplace_auctions FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_marketplace_auctions_listing ON marketplace_auctions(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_auctions_status ON marketplace_auctions(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_auctions_created_by ON marketplace_auctions(created_by);

DROP TRIGGER IF EXISTS trg_marketplace_auctions_touch ON marketplace_auctions;
CREATE TRIGGER trg_marketplace_auctions_touch
  BEFORE UPDATE ON marketplace_auctions
  FOR EACH ROW
  EXECUTE FUNCTION marketplace_touch_updated_at();

-- MARKETPLACE AUCTION SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS marketplace_auction_snapshots (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  auction_id uuid REFERENCES marketplace_auctions(id) ON DELETE CASCADE NOT NULL,
  block_number bigint,
  transaction_hash text,
  status text CHECK (status IN ('pending', 'live', 'extended', 'finalized', 'cancelled')),
  highest_bid_wei numeric(78, 0),
  highest_bidder_address text,
  bid_count integer,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_auction_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketplace auction snapshots are readable by all authenticated users"
  ON marketplace_auction_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_marketplace_auction_snapshots_auction ON marketplace_auction_snapshots(auction_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_auction_snapshots_block ON marketplace_auction_snapshots(block_number);

-- MARKETPLACE BIDS TABLE
CREATE TABLE IF NOT EXISTS marketplace_bids (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id uuid REFERENCES marketplace_auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  bidder_address text NOT NULL,
  amount_wei numeric(78, 0) NOT NULL,
  transaction_hash text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'refunded')),
  placed_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketplace bids are readable by all authenticated users"
  ON marketplace_bids FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Bidders can insert their own bids"
  ON marketplace_bids FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = bidder_user_id);

CREATE POLICY "Bidders can update their bid status"
  ON marketplace_bids FOR UPDATE
  TO authenticated
  USING (auth.uid() = bidder_user_id)
  WITH CHECK (auth.uid() = bidder_user_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_bids_auction ON marketplace_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_bids_bidder ON marketplace_bids(bidder_address);
CREATE INDEX IF NOT EXISTS idx_marketplace_bids_status ON marketplace_bids(status);

-- VIEW: MARKETPLACE LISTINGS VIEW WITH LATEST AUCTION SNAPSHOT
CREATE OR REPLACE VIEW marketplace_listings_view AS
SELECT
  l.id AS listing_id,
  l.token_id,
  l.contract_address,
  l.creator_address,
  l.owner_address,
  l.status,
  l.sale_type,
  l.reserve_price_wei,
  l.buy_now_price_wei,
  l.currency_address,
  l.start_time,
  l.end_time,
  l.metadata_uri,
  l.created_at,
  l.updated_at,
  a.id AS auction_id,
  a.auction_address,
  a.status AS auction_status,
  a.highest_bid_wei,
  a.highest_bidder_address,
  a.bid_count,
  a.start_time AS auction_start_time,
  a.end_time AS auction_end_time,
  s.block_number AS latest_block_number,
  s.status AS latest_snapshot_status,
  s.highest_bid_wei AS snapshot_highest_bid_wei,
  s.highest_bidder_address AS snapshot_highest_bidder,
  s.bid_count AS snapshot_bid_count,
  s.recorded_at AS snapshot_recorded_at
FROM marketplace_listings l
LEFT JOIN LATERAL (
  SELECT ma.*
  FROM marketplace_auctions ma
  WHERE ma.listing_id = l.id
  ORDER BY ma.created_at DESC
  LIMIT 1
) a ON true
LEFT JOIN LATERAL (
  SELECT mas.*
  FROM marketplace_auction_snapshots mas
  WHERE mas.auction_id = a.id
  ORDER BY mas.recorded_at DESC
  LIMIT 1
) s ON true;

-- VIEW: MARKETPLACE BID HISTORY VIEW
CREATE OR REPLACE VIEW marketplace_bid_history_view AS
SELECT
  b.id AS bid_id,
  b.auction_id,
  b.bidder_user_id,
  b.bidder_address,
  b.amount_wei,
  b.transaction_hash,
  b.status,
  b.placed_at,
  a.listing_id,
  l.token_id,
  l.contract_address
FROM marketplace_bids b
JOIN marketplace_auctions a ON b.auction_id = a.id
JOIN marketplace_listings l ON a.listing_id = l.id;

