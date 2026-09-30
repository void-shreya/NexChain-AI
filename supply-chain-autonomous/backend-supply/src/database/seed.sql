-- ============================================================================
-- SUPPLY CHAIN DISRUPTION AUTONOMOUS RESPONSE PLATFORM
-- Realistic Seed Data (Indian Logistics & High-Tech Manufacturing Context)
-- ============================================================================

-- 1. Initial Users (password for all is 'Password123!' -> bcrypt hash: $2a$10$wK6O8Qz99jS2i5pM9gGv/O9XFqE4Y/gR0u5xK.6K9b5C1V8x2Wq8G or generated via backend)
-- We will insert or update demo credentials

-- 2. Warehouses
INSERT INTO warehouses (id, code, name, city, state, country, latitude, longitude, total_capacity_units, utilized_capacity_units, operational_status, contact_phone)
VALUES
('a0000001-0000-0000-0000-000000000001', 'WH-BHIWANDI', 'Western India Mega Fulfillment Center', 'Bhiwandi (Mumbai)', 'Maharashtra', 'India', 19.2967, 73.0631, 250000, 198000, 'OPERATIONAL', '+91 22 4589 1101'),
('a0000001-0000-0000-0000-000000000002', 'WH-WHITEFIELD', 'Southern Tech Logistics Park', 'Bengaluru', 'Karnataka', 'India', 12.9698, 77.7500, 180000, 142000, 'OPERATIONAL', '+91 80 6620 4400'),
('a0000001-0000-0000-0000-000000000003', 'WH-SRIPERUMBUDUR', 'Chennai Corridor Assembly Depot', 'Sriperumbudur', 'Tamil Nadu', 'India', 12.9700, 79.9400, 200000, 175000, 'CONGESTED', '+91 44 2716 8800'),
('a0000001-0000-0000-0000-000000000004', 'WH-MANESAR', 'Northern Auto Hub Distribution Center', 'Manesar (Gurugram)', 'Haryana', 'India', 28.3588, 76.9388, 220000, 165000, 'OPERATIONAL', '+91 124 492 3300'),
('a0000001-0000-0000-0000-000000000005', 'WH-SHAMSHABAD', 'Central Aerospace & Electronics Transshipment', 'Hyderabad', 'Telangana', 'India', 17.2403, 78.4294, 150000, 95000, 'OPERATIONAL', '+91 40 2400 9900')
ON CONFLICT (id) DO NOTHING;

-- 3. Suppliers
INSERT INTO suppliers (id, code, name, tier, category, city, state, country, latitude, longitude, reliability_score, avg_lead_time_days, capacity_units_per_month, cost_index, status, risk_level)
VALUES
('b0000001-0000-0000-0000-000000000001', 'SUP-TATA-PUNE', 'Tata AutoComp Systems Ltd', 'TIER_1', 'Automotive Microcontrollers', 'Pune', 'Maharashtra', 'India', 18.5204, 73.8567, 86.4, 4, 85000, 1.00, 'CRITICAL_SHUTDOWN', 'CRITICAL'),
('b0000001-0000-0000-0000-000000000002', 'SUP-BHARAT-BLR', 'Bharat Silicon & Foundry Ltd', 'TIER_1', 'MCUs & Power MOSFETs', 'Bengaluru', 'Karnataka', 'India', 12.9716, 77.5946, 96.8, 5, 60000, 1.08, 'ACTIVE', 'LOW'),
('b0000001-0000-0000-0000-000000000003', 'SUP-FOXCONN-CHN', 'Foxconn Precision Industrial Hub', 'Sriperumbudur', 'Tamil Nadu', 'India', 12.9800, 79.9500, 93.2, 6, 120000, 1.04, 'ACTIVE', 'MEDIUM'),
('b0000001-0000-0000-0000-000000000004', 'SUP-VEDANTA-GUJ', 'Vedanta Semiconductor Dholera', 'Dholera', 'Gujarat', 'India', 22.2472, 72.1969, 91.5, 7, 75000, 0.98, 'ACTIVE', 'LOW'),
('b0000001-0000-0000-0000-000000000005', 'SUP-MOTHER-NOI', 'Motherson Sumi Systems', 'Noida', 'Uttar Pradesh', 'India', 28.5355, 77.3910, 94.0, 5, 90000, 1.02, 'ACTIVE', 'LOW'),
('b0000001-0000-0000-0000-000000000006', 'SUP-EXIDE-HOS', 'Exide Energy Solutions EV Cell', 'Hosur', 'Tamil Nadu', 'India', 12.7409, 77.8253, 89.2, 8, 45000, 1.12, 'ACTIVE', 'MEDIUM'),
('b0000001-0000-0000-0000-000000000007', 'SUP-LUMAX-GUR', 'Lumax Auto Technologies', 'Gurugram', 'Haryana', 'India', 28.4595, 77.0266, 95.1, 4, 55000, 1.01, 'ACTIVE', 'LOW'),
('b0000001-0000-0000-0000-000000000008', 'SUP-DIXON-TIR', 'Dixon Technologies Precision', 'Tirupati', 'Andhra Pradesh', 'India', 13.6288, 79.4192, 97.4, 5, 80000, 1.05, 'ACTIVE', 'LOW'),
('b0000001-0000-0000-0000-000000000009', 'SUP-STERL-AUR', 'Sterlite Optical Nodes', 'Aurangabad', 'Maharashtra', 'India', 19.8762, 75.3433, 90.3, 6, 40000, 1.03, 'ACTIVE', 'MEDIUM'),
('b0000001-0000-0000-0000-000000000010', 'SUP-SUNDR-CHN', 'Sundram Precision Fasteners', 'Chennai', 'Tamil Nadu', 'India', 13.0827, 80.2707, 98.1, 3, 150000, 0.95, 'ACTIVE', 'LOW'),
('b0000001-0000-0000-0000-000000000011', 'SUP-HAVELLS-RAJ', 'Havells Industrial Components', 'Neemrana', 'Rajasthan', 'India', 27.9888, 76.3883, 93.6, 5, 65000, 1.02, 'ACTIVE', 'LOW'),
('b0000001-0000-0000-0000-000000000012', 'SUP-BFORGE-PUN', 'Bharat Forge Advanced Metallurgy', 'Pune', 'Maharashtra', 'India', 18.5500, 73.9000, 92.0, 7, 70000, 1.06, 'WARNING', 'HIGH')
ON CONFLICT (id) DO NOTHING;

-- 4. Supplier Risk Breakdown (5 factors: delivery, geopolitical, financial, weather, capacity)
INSERT INTO supplier_risk_scores (id, supplier_id, overall_score, delivery_risk, geopolitical_risk, financial_health_risk, weather_climate_risk, capacity_constraint_risk, risk_summary)
VALUES
('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 88.5, 92.0, 15.0, 30.0, 95.0, 85.0, 'Critical risk due to ongoing Chakan flash flood and power grid failure at plant 3. 100% production halt.'),
('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 22.0, 18.0, 10.0, 20.0, 15.0, 35.0, 'Highly stable. Dual-source clean room operational with 25% surplus capacity ready for immediate allocation.'),
('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003', 46.5, 42.0, 25.0, 15.0, 58.0, 48.0, 'Moderate coastal monsoon advisory in Bay of Bengal. Ports operating with 12h cargo buffer.'),
('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000004', 28.0, 25.0, 20.0, 22.0, 10.0, 40.0, 'Stable western corridor operations. High capital reserves and solar microgrid backup.')
ON CONFLICT (id) DO NOTHING;

-- 5. Enterprise Customers
INSERT INTO customers (id, code, name, tier, sla_hours, penalty_per_day_inr, city, state, latitude, longitude, contact_email)
VALUES
('d0000001-0000-0000-0000-000000000001', 'CUST-MARUTI', 'Maruti Suzuki India Ltd', 'TIER_1_ENTERPRISE', 24, 75000.00, 'Gurugram', 'Haryana', 28.4595, 77.0266, 'procurement@maruti.co.in'),
('d0000001-0000-0000-0000-000000000002', 'CUST-MAHINDRA', 'Mahindra & Mahindra Auto Division', 'TIER_1_ENTERPRISE', 24, 65000.00, 'Nashik / Chakan', 'Maharashtra', 19.9975, 73.7898, 'supply@mahindra.com'),
('d0000001-0000-0000-0000-000000000003', 'CUST-TATAMOTORS', 'Tata Motors Commercial Vehicles', 'TIER_1_ENTERPRISE', 36, 80000.00, 'Pune', 'Maharashtra', 18.5204, 73.8567, 'ev-supply@tatamotors.com'),
('d0000001-0000-0000-0000-000000000004', 'CUST-ATHER', 'Ather Energy Smart EV Labs', 'TIER_1_ENTERPRISE', 48, 50000.00, 'Bengaluru', 'Karnataka', 12.9716, 77.5946, 'ops@atherenergy.com'),
('d0000001-0000-0000-0000-000000000005', 'CUST-BOSCH', 'Bosch India Mobility Solutions', 'TIER_2_COMMERCIAL', 48, 35000.00, 'Bengaluru', 'Karnataka', 12.9352, 77.6245, 'india.supply@bosch.com'),
('d0000001-0000-0000-0000-000000000006', 'CUST-SIEMENS', 'Siemens India Industrial Automation', 'TIER_2_COMMERCIAL', 72, 30000.00, 'Kalwa (Thane)', 'Maharashtra', 19.2000, 72.9800, 'procurement@siemens.co.in'),
('d0000001-0000-0000-0000-000000000007', 'CUST-HAVELLS', 'Havells Consumer Goods Division', 'TIER_3_STANDARD', 96, 15000.00, 'Noida', 'Uttar Pradesh', 28.5355, 77.3910, 'logistics@havells.com')
ON CONFLICT (id) DO NOTHING;

-- 6. Active Disruptions (The centerpiece demo scenario)
INSERT INTO disruptions (id, code, title, type, severity, status, source, affected_entity_type, affected_entity_id, affected_entity_name, latitude, longitude, radius_km, expected_duration_days, estimated_loss_inr, detected_at)
VALUES
('e0000001-0000-0000-0000-000000000001', 'DISRUPT-2026-0901', 'Flash Flood & Substation Grid Outage at Pune Industrial Hub', 'SUPPLIER_SHUTDOWN', 'CRITICAL', 'ACTIVE', 'IOT_POWER_GRID_TELEMETRY', 'SUPPLIER', 'b0000001-0000-0000-0000-000000000001', 'Tata AutoComp Systems Ltd (Chakan Plant)', 18.7500, 73.8500, 35, 5, 24500000.00, NOW() - INTERVAL '45 minutes')
ON CONFLICT (id) DO NOTHING;
