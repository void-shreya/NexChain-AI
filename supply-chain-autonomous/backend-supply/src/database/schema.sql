-- ============================================================================
-- SUPPLY CHAIN DISRUPTION AUTONOMOUS RESPONSE PLATFORM
-- Database Schema Definition for Supabase / PostgreSQL
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS & ROLES (RBAC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
('ADMIN', 'System Administrator', 'Full control over system configurations, agent policies, and users'),
('SUPPLY_MANAGER', 'Supply Chain Manager', 'Manages suppliers, inventory thresholds, and approves recovery orders'),
('OPERATIONS_MANAGER', 'Operations Manager', 'Oversees warehouse allocations, logistics, and dispatches'),
('VIEWER', 'Executive Viewer', 'Read-only access to control tower analytics and decision audit logs')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_id VARCHAR(50) REFERENCES roles(id) DEFAULT 'SUPPLY_MANAGER',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. GEOGRAPHICAL HUBS: WAREHOUSES & SUPPLIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    total_capacity_units INT NOT NULL,
    utilized_capacity_units INT DEFAULT 0,
    operational_status VARCHAR(50) DEFAULT 'OPERATIONAL', -- OPERATIONAL, CONGESTED, HALTED
    contact_phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    tier VARCHAR(10) DEFAULT 'TIER_1', -- TIER_1, TIER_2, TIER_3
    category VARCHAR(100) NOT NULL,   -- Semiconductors, Automotive, Raw Materials, Batteries
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    reliability_score NUMERIC(5, 2) DEFAULT 95.0, -- Percentage
    avg_lead_time_days INT DEFAULT 5,
    capacity_units_per_month INT DEFAULT 50000,
    cost_index NUMERIC(5, 2) DEFAULT 1.0, -- 1.0 = baseline, 1.25 = 25% premium
    status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, WARNING, CRITICAL_SHUTDOWN, INACTIVE
    risk_level VARCHAR(20) DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    evaluation_month DATE NOT NULL,
    on_time_delivery_rate NUMERIC(5, 2) NOT NULL,
    quality_defect_rate NUMERIC(5, 2) NOT NULL,
    avg_delay_days NUMERIC(4, 2) DEFAULT 0,
    historical_disruptions_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    overall_score NUMERIC(5, 2) NOT NULL, -- 0 - 100 (higher = riskier)
    delivery_risk NUMERIC(5, 2) NOT NULL,
    geopolitical_risk NUMERIC(5, 2) NOT NULL,
    financial_health_risk NUMERIC(5, 2) NOT NULL,
    weather_climate_risk NUMERIC(5, 2) NOT NULL,
    capacity_constraint_risk NUMERIC(5, 2) NOT NULL,
    risk_summary TEXT,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. PRODUCTS & INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_cost_inr NUMERIC(12, 2) NOT NULL,
    selling_price_inr NUMERIC(12, 2) NOT NULL,
    primary_supplier_id UUID REFERENCES suppliers(id),
    criticality VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, MISSION_CRITICAL
    lead_time_days INT DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alternative_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    preference_rank INT DEFAULT 1,
    lead_time_days INT NOT NULL,
    unit_cost_inr NUMERIC(12, 2) NOT NULL,
    capacity_available INT DEFAULT 10000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, supplier_id)
);

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    current_stock INT NOT NULL DEFAULT 0,
    reserved_stock INT NOT NULL DEFAULT 0,
    available_stock INT GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    safety_stock_threshold INT NOT NULL DEFAULT 200,
    reorder_point INT NOT NULL DEFAULT 400,
    daily_demand_rate INT NOT NULL DEFAULT 35,
    days_of_supply INT GENERATED ALWAYS AS (
        CASE WHEN daily_demand_rate > 0 THEN current_stock / daily_demand_rate ELSE 999 END
    ) STORED,
    status VARCHAR(50) DEFAULT 'SAFE', -- SAFE, WATCH, AT_RISK, STOCKOUT_RISK
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS inventory_risk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    risk_level VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, SEVERE
    predicted_stockout_date TIMESTAMPTZ,
    revenue_at_risk_inr NUMERIC(14, 2) DEFAULT 0,
    recommendation TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. CUSTOMERS & ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    tier VARCHAR(20) DEFAULT 'TIER_2', -- TIER_1_ENTERPRISE, TIER_2_COMMERCIAL, TIER_3_STANDARD
    sla_hours INT DEFAULT 48,
    penalty_per_day_inr NUMERIC(12, 2) DEFAULT 5000.00,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    contact_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    total_amount_inr NUMERIC(14, 2) NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL', -- CRITICAL, HIGH, NORMAL, LOW
    status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, PROCESSING, ALLOCATED, IN_TRANSIT, DELAYED, AT_RISK, DELIVERED, CANCELLED
    risk_status VARCHAR(50) DEFAULT 'ON_TRACK', -- ON_TRACK, WATCH, HIGH_RISK, CRITICAL_DELAY
    promised_delivery_date TIMESTAMPTZ NOT NULL,
    estimated_delivery_date TIMESTAMPTZ NOT NULL,
    prioritization_score NUMERIC(6, 2) DEFAULT 50.0,
    prioritization_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price_inr NUMERIC(12, 2) NOT NULL,
    allocated_warehouse_id UUID REFERENCES warehouses(id),
    fulfillment_status VARCHAR(50) DEFAULT 'PENDING'
);

-- ============================================================================
-- 5. LOGISTICS, SHIPMENTS & ROUTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS delivery_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name VARCHAR(150) NOT NULL,
    origin_type VARCHAR(50) NOT NULL,      -- SUPPLIER, WAREHOUSE
    origin_id UUID NOT NULL,
    destination_type VARCHAR(50) NOT NULL, -- WAREHOUSE, CUSTOMER
    destination_id UUID NOT NULL,
    standard_duration_hours INT NOT NULL,
    distance_km INT NOT NULL,
    transport_mode VARCHAR(50) DEFAULT 'ROAD_EXPRESS', -- ROAD_EXPRESS, AIR_CARGO, RAIL_FREIGHT, SEA_CONTAINER
    risk_factor NUMERIC(4, 2) DEFAULT 1.0,
    waypoints JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    route_id UUID REFERENCES delivery_routes(id),
    carrier_name VARCHAR(100) NOT NULL, -- Blue Dart, Delhivery, VRL Logistics, Gati
    vehicle_type VARCHAR(50) DEFAULT 'Heavy Truck',
    vehicle_registration VARCHAR(50),
    origin_name VARCHAR(150) NOT NULL,
    destination_name VARCHAR(150) NOT NULL,
    current_latitude NUMERIC(10, 6) NOT NULL,
    current_longitude NUMERIC(10, 6) NOT NULL,
    status VARCHAR(50) DEFAULT 'IN_TRANSIT', -- PREPARING, DISPATCHED, IN_TRANSIT, DELAYED, AT_RISK, DELIVERED
    speed_kmh NUMERIC(5, 2) DEFAULT 55.0,
    dispatched_at TIMESTAMPTZ,
    estimated_arrival TIMESTAMPTZ NOT NULL,
    delay_hours INT DEFAULT 0,
    cargo_temperature_celsius NUMERIC(4, 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- CHECKPOINT_PASSED, CONGESTION_DETECTED, ROUTE_DIVERSIION, DELAY_ALERT
    message TEXT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. DISRUPTIONS & INCIDENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS disruptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(250) NOT NULL,
    type VARCHAR(100) NOT NULL, -- SUPPLIER_SHUTDOWN, PORT_CONGESTION, WEATHER_CYCLONE, HIGHWAY_BLOCKAGE, DEMAND_SURGE, FACTORY_FIRE
    severity VARCHAR(20) DEFAULT 'HIGH', -- CRITICAL, HIGH, MEDIUM, LOW
    status VARCHAR(50) DEFAULT 'ACTIVE', -- DETECTED, ANALYZING, MITIGATING, RESOLVED, CLOSED
    source VARCHAR(100) DEFAULT 'IOT_SENSOR_FEED',
    affected_entity_type VARCHAR(50) NOT NULL, -- SUPPLIER, ROUTE, WAREHOUSE, REGION
    affected_entity_id UUID,
    affected_entity_name VARCHAR(200) NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    radius_km INT DEFAULT 50,
    expected_duration_days INT DEFAULT 5,
    estimated_loss_inr NUMERIC(14, 2) DEFAULT 0,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disruption_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disruption_id UUID REFERENCES disruptions(id) ON DELETE CASCADE,
    phase VARCHAR(50) NOT NULL, -- DETECT, UNDERSTAND, PREDICT, SIMULATE, DECIDE, ACT, MONITOR, LEARN
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. WHAT-IF SIMULATIONS & SCENARIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disruption_id UUID REFERENCES disruptions(id),
    name VARCHAR(200) NOT NULL,
    scenario_type VARCHAR(100) NOT NULL,
    input_parameters JSONB NOT NULL,
    baseline_scenario JSONB NOT NULL,  -- Current projection without intervention
    recovery_scenario JSONB NOT NULL,  -- Projected metrics with selected interventions
    delta_metrics JSONB NOT NULL,      -- Cost diff, delay reduction, orders saved
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. AI DECISION ENGINE & ACTIONS (SUPPLYCHAIN GUARDIAN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disruption_id UUID REFERENCES disruptions(id),
    agent_name VARCHAR(100) DEFAULT 'SupplyChain Guardian v2.4',
    summary TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    affected_orders JSONB DEFAULT '[]'::jsonb,
    affected_inventory JSONB DEFAULT '[]'::jsonb,
    candidate_actions JSONB NOT NULL, -- Options A, B, C, D, E, F with calculated scores
    selected_action VARCHAR(50) NOT NULL, -- e.g. 'OPTION_B_ALTERNATIVE_SUPPLIER'
    selected_action_title VARCHAR(200) NOT NULL,
    reasoning_summary TEXT NOT NULL,
    estimated_cost_inr NUMERIC(14, 2) NOT NULL,
    estimated_delay_hours INT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    confidence_score NUMERIC(5, 2) DEFAULT 94.5,
    requires_human_approval BOOLEAN DEFAULT TRUE,
    approval_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, AUTO_EXECUTED
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    execution_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_decision_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES ai_decisions(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- REROUTE_SHIPMENT, PURCHASE_EMERGENCY_STOCK, SPLIT_PURCHASE_ORDER, EXPEDITE_AIR_FREIGHT
    target_entity VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, EXECUTED, FAILED
    result_summary TEXT,
    executed_at TIMESTAMPTZ
);

-- ============================================================================
-- 9. AUDIT LOGS, NOTIFICATIONS & SYSTEM EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(150) DEFAULT 'SupplyChain Guardian AI',
    agent_id VARCHAR(100) DEFAULT 'Guardian-Autonomous-Agent-01',
    event_category VARCHAR(100) NOT NULL, -- AI_DECISION, HUMAN_APPROVAL, RECOVERY_EXECUTION, DISRUPTION_TRIGGER
    event_name VARCHAR(200) NOT NULL,
    input_context_summary TEXT NOT NULL,
    decision_summary TEXT,
    action_taken TEXT,
    approval_status VARCHAR(50),
    result_status VARCHAR(50) DEFAULT 'SUCCESS',
    details JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO', -- CRITICAL, WARNING, SUCCESS, INFO, APPROVAL_REQUIRED
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    severity VARCHAR(20) DEFAULT 'LOW',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. INDEXES FOR HIGH PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_risk ON orders(risk_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_disruptions_status ON disruptions(status);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_approval ON ai_decisions(approval_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all sensitive operational and audit tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Documented RLS Policies:
-- 1. Users table: Users can view their own profile; Admins have full access.
CREATE POLICY "Users view own record" ON users
    FOR SELECT USING (auth.uid() = id);

-- 2. Audit logs: Immutable write, readable by authenticated enterprise users.
CREATE POLICY "Authenticated users view audit logs" ON audit_logs
    FOR SELECT TO authenticated USING (true);

-- 3. AI Decisions: Authenticated users can view decisions; Managers/Admins can update approval.
CREATE POLICY "Authenticated users view decisions" ON ai_decisions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers and Admins update decisions" ON ai_decisions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() 
            AND role_id IN ('ADMIN', 'SUPPLY_MANAGER', 'OPERATIONS_MANAGER')
        )
    );

-- 4. Orders: Authenticated users can read all active supply chain orders.
CREATE POLICY "Authenticated users read orders" ON orders
    FOR SELECT TO authenticated USING (true);

-- 5. Notifications: Users can read and mark notifications read.
CREATE POLICY "Users read all notifications" ON notifications
    FOR ALL TO authenticated USING (true);
