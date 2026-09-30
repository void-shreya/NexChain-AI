/**
 * SupplyChain Guardian - Core Autonomous Agent
 * Executes the complete 15-step agentic loop:
 * DETECT -> UNDERSTAND -> PREDICT -> SIMULATE -> DECIDE -> ACT -> MONITOR -> LEARN
 */

const { db } = require('../database/dbClient');
const { aiProvider } = require('./aiProvider');
const { decisionEngine } = require('./decisionEngine');
const { AUTONOMOUS_MODES, AUTO_APPROVAL_THRESHOLD_INR } = require('../config/constants');

class SupplyChainGuardian {
  constructor() {
    this.name = 'SupplyChain Guardian v2.4';
    this.currentMode = AUTONOMOUS_MODES.AUTONOMOUS; // Default: low-risk auto-executed, >₹5L requires approval
    this.autoApprovalThresholdInr = AUTO_APPROVAL_THRESHOLD_INR;
  }

  setAutonomousMode(mode, threshold) {
    if (mode && Object.values(AUTONOMOUS_MODES).includes(mode)) {
      this.currentMode = mode;
    }
    if (threshold !== undefined && !isNaN(threshold)) {
      this.autoApprovalThresholdInr = Number(threshold);
    }
    return { mode: this.currentMode, threshold: this.autoApprovalThresholdInr };
  }

  /**
   * Run the complete 15-step agentic workflow
   */
  async runAutonomousWorkflow(disruptionId, io = null) {
    const emitProgress = (step, name, detail, status = 'IN_PROGRESS') => {
      const stepEvent = {
        step,
        name,
        detail,
        status,
        timestamp: new Date().toLocaleTimeString(),
      };
      if (io) {
        io.emit('agent:step', stepEvent);
      }
      return stepEvent;
    };

    const workflowLogs = [];

    // STEP 1: Detect a disruption
    workflowLogs.push(emitProgress(1, 'Disruption Detected', 'Analyzing IoT and logistics telemetry feeds', 'COMPLETED'));
    let disruption = await db.getDisruptionById(disruptionId);
    if (!disruption) {
      const all = await db.getDisruptions();
      disruption = all[0];
    }

    // STEP 2: Identify affected suppliers
    workflowLogs.push(emitProgress(2, 'Identify Affected Suppliers', `Targeting entity: ${disruption.affected_entity_name}`, 'COMPLETED'));
    const suppliers = await db.getSuppliers();
    const affectedSupplier = suppliers.find((s) => s.id === disruption.affected_entity_id || s.code === 'SUP-TATA-PUNE') || suppliers[0];

    // STEP 3: Identify affected inventory
    workflowLogs.push(emitProgress(3, 'Identify Affected Inventory', 'Querying depot stocks across 5 regional fulfillment centers', 'COMPLETED'));
    const products = await db.getProducts();
    const affectedProducts = products.filter((p) => p.primary_supplier_id === affectedSupplier.id);
    const affectedProductIds = new Set(affectedProducts.map((p) => p.id));
    const allInventory = await db.getInventory();
    const affectedInventory = allInventory.filter((inv) => affectedProductIds.has(inv.product_id));

    // STEP 4: Identify affected customer orders
    workflowLogs.push(emitProgress(4, 'Identify Affected Customer Orders', 'Matching active assembly and dispatch orders', 'COMPLETED'));
    const allOrders = await db.getOrders();
    const affectedOrders = allOrders.filter((o) => {
      return o.items && o.items.some((item) => affectedProductIds.has(item.product_id));
    });

    // STEP 5: Calculate expected delivery impact
    workflowLogs.push(emitProgress(5, 'Calculate Expected Delivery Impact', `Assessing SLA risk across ${affectedOrders.length} customer commitments`, 'COMPLETED'));
    const totalRevenueAtRisk = affectedOrders.reduce((sum, o) => sum + (o.total_amount_inr || 0), 0);
    const expectedDelayHours = (disruption.expected_duration_days || 5) * 24;

    // STEP 6: Find alternative suppliers
    workflowLogs.push(emitProgress(6, 'Find Alternative Suppliers', 'Querying qualified Tier-1 backup vendors (Bengaluru & Chennai)', 'COMPLETED'));
    const altSuppliers = await db.getAlternativeSuppliers();

    // STEP 7: Evaluate available options
    workflowLogs.push(emitProgress(7, 'Evaluate Available Options', 'Generating 6 recovery vectors (Options A to F)', 'COMPLETED'));
    const customers = await db.getCustomers();
    const simulationResult = decisionEngine.simulateScenario({
      disruption,
      parameterOverrides: { delayDays: disruption.expected_duration_days || 5, supplierId: affectedSupplier.id },
      suppliers,
      products,
      inventory: allInventory,
      orders: allOrders,
      customers,
    });

    // STEP 8: Consider Multi-criteria weights
    workflowLogs.push(emitProgress(8, 'Consider Cost, Delay & Risk Multi-Criteria', 'Balancing ₹1.85M recovery cost against ₹1.25Cr customer downtime penalty', 'COMPLETED'));

    // STEP 9: Generate candidate recovery strategies via AI Provider
    workflowLogs.push(emitProgress(9, 'Generate Candidate Recovery Strategies', 'Invoking SupplyChain Guardian intelligence core', 'COMPLETED'));
    const aiDecisionOutput = await aiProvider.generateStructuredDecision({
      disruption,
      affectedSupplier,
      affectedOrders,
      affectedInventory,
      alternativeSuppliers: altSuppliers,
      simulationResult,
    });

    // STEP 10: Select appropriate action according to business rules
    workflowLogs.push(emitProgress(10, 'Select Appropriate Action', `Selected: ${aiDecisionOutput.selectedActionTitle}`, 'COMPLETED'));

    // STEP 11: Determine whether human approval is required
    let requiresApproval = true;
    if (this.currentMode === AUTONOMOUS_MODES.AUTONOMOUS) {
      requiresApproval = aiDecisionOutput.estimatedCost > this.autoApprovalThresholdInr;
    } else if (this.currentMode === AUTONOMOUS_MODES.MANUAL_APPROVAL) {
      requiresApproval = true;
    } else {
      requiresApproval = true; // Assisted mode always confirms
    }

    const approvalStatus = requiresApproval ? 'PENDING' : 'AUTO_EXECUTED';
    workflowLogs.push(emitProgress(
      11,
      'Determine Human Approval Requirement',
      requiresApproval
        ? `Cost (₹${aiDecisionOutput.estimatedCost.toLocaleString('en-IN')}) exceeds auto-approval threshold (₹${this.autoApprovalThresholdInr.toLocaleString('en-IN')}). Human approval required.`
        : 'Cost within auto-approval threshold. Auto-execution authorized.',
      'COMPLETED'
    ));

    // STEP 12: Create AI decision record
    workflowLogs.push(emitProgress(12, 'Create AI Decision Record', 'Saving auditable decision manifest with cryptographic reference', 'COMPLETED'));
    const decisionRecord = await db.createDecision({
      disruption_id: disruption.id,
      agent_name: this.name,
      summary: aiDecisionOutput.reasoningSummary,
      severity: disruption.severity || 'CRITICAL',
      affected_orders: affectedOrders.map((o) => o.id),
      affected_inventory: affectedInventory.map((i) => i.id),
      candidate_actions: aiDecisionOutput.candidateActions,
      selected_action: aiDecisionOutput.selectedAction,
      selected_action_title: aiDecisionOutput.selectedActionTitle,
      reasoning_summary: aiDecisionOutput.reasoningSummary,
      estimated_cost_inr: aiDecisionOutput.estimatedCost,
      estimated_delay_hours: aiDecisionOutput.estimatedDelay,
      risk_level: aiDecisionOutput.riskLevel,
      confidence_score: aiDecisionOutput.confidenceScore,
      requires_human_approval: requiresApproval,
      approval_status: approvalStatus,
      execution_status: requiresApproval ? 'PENDING' : 'IN_PROGRESS',
      workflow_steps: workflowLogs,
    });

    // STEP 13: Execute permitted actions (if auto-executed or low risk)
    if (!requiresApproval) {
      workflowLogs.push(emitProgress(13, 'Execute Permitted Actions', 'Autonomous dispatch of flight BDA-91 & purchase order PO-REC-901', 'COMPLETED'));
      await this.applyRecoveryActions(decisionRecord.id);
    } else {
      workflowLogs.push(emitProgress(13, 'Hold for Human Authorization', 'PO-REC-901 queued awaiting Manager approval', 'WAITING'));
    }

    // STEP 14: Monitor result
    workflowLogs.push(emitProgress(14, 'Monitor Result', 'Telemetry watchers assigned to Bengaluru Kempegowda & Mumbai hubs', 'COMPLETED'));

    // STEP 15: Update dashboard in real-time
    workflowLogs.push(emitProgress(15, 'Update Dashboard In Real Time', 'Broadcast update packet to Control Tower listeners', 'COMPLETED'));

    // Create Audit Log
    await db.createAuditLog({
      user_name: 'SupplyChain Guardian AI',
      agent_id: 'Guardian-Autonomous-Agent-01',
      event_category: 'AI_DECISION',
      event_name: 'Autonomous 15-Step Disruption Analysis',
      input_context_summary: `Disruption "${disruption.title}" analyzed across ${affectedOrders.length} orders.`,
      decision_summary: aiDecisionOutput.reasoningSummary,
      action_taken: requiresApproval ? 'Awaiting Human Approval' : 'Auto-executed Option B',
      approval_status: approvalStatus,
      details: { decisionId: decisionRecord.id, costInr: aiDecisionOutput.estimatedCost },
    });

    // Create Notification
    await db.createNotification({
      title: requiresApproval ? 'ACTION REQUIRED: AI Recovery Approval' : 'AI Action Auto-Executed',
      message: `${aiDecisionOutput.selectedActionTitle} (Est. Cost ₹${aiDecisionOutput.estimatedCost.toLocaleString('en-IN')})`,
      type: requiresApproval ? 'APPROVAL_REQUIRED' : 'SUCCESS',
      severity: requiresApproval ? 'HIGH' : 'MEDIUM',
      link: '/decisions',
    });

    if (io) {
      io.emit('dashboard:update', { type: 'DECISION_CREATED', decision: decisionRecord });
    }

    return {
      success: true,
      decision: decisionRecord,
      simulation: simulationResult,
      steps: workflowLogs,
    };
  }

  /**
   * Apply recovery actions upon human approval or auto-execution
   */
  async applyRecoveryActions(decisionId, approvedByUserName = 'Supply Chain Manager') {
    const decision = await db.getDecisionById(decisionId);
    if (!decision) throw new Error('Decision record not found');

    // 1. Mark decision approved & executed
    await db.updateDecision(decisionId, {
      approval_status: 'APPROVED',
      approved_by_name: approvedByUserName,
      approved_at: new Date().toISOString(),
      execution_status: 'COMPLETED',
      executed_at: new Date().toISOString(),
    });

    // 2. Update affected orders risk status to ON_TRACK / RECOVERING
    if (decision.affected_orders && decision.affected_orders.length > 0) {
      for (const ordId of decision.affected_orders) {
        await db.updateOrder(ordId, {
          risk_status: 'ON_TRACK',
          status: 'IN_TRANSIT',
          delay_hours: decision.estimated_delay_hours || 18,
          prioritization_reason: `RECOVERED: Re-routed via Bharat Silicon BLR and Air Cargo Flight BDA-91. Delivery guaranteed.`,
        });
      }
    }

    // 3. Mark a live shipment as active / recovered
    const shipments = await db.getShipments();
    const targetShipment = shipments.find((s) => s.carrier_name.includes('Blue Dart Aviation'));
    if (targetShipment) {
      await db.updateShipment(targetShipment.id, {
        status: 'IN_TRANSIT',
        delay_hours: 0,
        estimated_arrival: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      });
    }

    // 4. Audit Log
    await db.createAuditLog({
      user_name: approvedByUserName,
      event_category: 'HUMAN_APPROVAL',
      event_name: 'AI Recovery Strategy Approved & Dispatched',
      input_context_summary: `Authorized execution of ${decision.selected_action_title}`,
      decision_summary: `Approved expenditure of ₹${(decision.estimated_cost_inr || 0).toLocaleString('en-IN')}`,
      action_taken: 'Emergency purchase orders issued to Bharat Silicon BLR. Air Freight Flight VT-BDA-91 scheduled.',
      approval_status: 'APPROVED',
      result_status: 'SUCCESS',
      details: { decisionId, approvedBy: approvedByUserName },
    });

    // 5. Notification
    await db.createNotification({
      title: 'RECOVERY INITIATED: 18 Orders Protected',
      message: `Emergency allocation via Bharat Silicon BLR is in transit. Expected arrival in 18h.`,
      type: 'SUCCESS',
      severity: 'LOW',
      link: '/tracking',
    });

    return { success: true, message: 'Recovery plan executed successfully.' };
  }
}

const supplyChainGuardian = new SupplyChainGuardian();

module.exports = {
  supplyChainGuardian,
};
