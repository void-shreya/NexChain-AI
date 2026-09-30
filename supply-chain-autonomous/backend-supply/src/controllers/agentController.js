const { db } = require('../database/dbClient');
const { supplyChainGuardian } = require('../agents/supplyChainGuardian');
const { aiProvider } = require('../agents/aiProvider');

/**
 * Trigger full 15-step agentic analysis for a disruption
 */
const analyzeDisruption = async (req, res, next) => {
  try {
    const { disruptionId } = req.body;
    const io = req.app.get('io');
    const result = await supplyChainGuardian.runAutonomousWorkflow(disruptionId, io);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * Natural Language Command Center & Voice AI Query Endpoint
 */
const processCommand = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Command text query is required' });
    }

    const [orders, suppliers, inventory, shipments, disruptions] = await Promise.all([
      db.getOrders(),
      db.getSuppliers(),
      db.getInventory(),
      db.getShipments(),
      db.getDisruptions(),
    ]);

    const operationalState = { orders, suppliers, inventory, shipments, disruptions };
    const response = await aiProvider.processNaturalLanguageQuery(query, operationalState);

    // If the query was a command that triggered a disruption scenario:
    if (response.suggestedAction === 'RUN_AUTONOMOUS_PIPELINE') {
      const io = req.app.get('io');
      supplyChainGuardian.runAutonomousWorkflow(disruptions[0]?.id, io);
    }

    // Log query in audit log for transparency
    await db.createAuditLog({
      user_name: req.user?.full_name || 'Operator',
      event_category: 'AI_COMMAND_CENTER',
      event_name: 'Natural Language Query / Voice Prompt',
      input_context_summary: `Prompt: "${query}"`,
      decision_summary: response.textResponse,
      action_taken: `Engine response dispatched. Suggested action: ${response.suggestedAction}`,
      approval_status: 'AUTO_EXECUTED',
      details: { query, response },
    });

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
};

/**
 * Human-in-the-loop: Approve AI Decision Action
 */
const approveAction = async (req, res, next) => {
  try {
    const { decisionId, comments } = req.body;
    if (!decisionId) {
      return res.status(400).json({ success: false, error: 'decisionId is required' });
    }

    const result = await supplyChainGuardian.applyRecoveryActions(
      decisionId,
      req.user?.full_name || 'Supply Chain Manager'
    );

    const io = req.app.get('io');
    if (io) {
      const updated = await db.getDecisionById(decisionId);
      io.emit('decision:updated', updated);
      io.emit('dashboard:update', { type: 'DECISION_APPROVED', decisionId });
    }

    res.json({ success: true, message: 'AI Action authorized and dispatched', data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * Human-in-the-loop: Reject AI Decision Action
 */
const rejectAction = async (req, res, next) => {
  try {
    const { decisionId, reason } = req.body;
    if (!decisionId) {
      return res.status(400).json({ success: false, error: 'decisionId is required' });
    }

    const decision = await db.getDecisionById(decisionId);
    if (!decision) {
      return res.status(404).json({ success: false, error: 'Decision not found' });
    }

    await db.updateDecision(decisionId, {
      approval_status: 'REJECTED',
      rejection_reason: reason || 'Rejected by Manager due to budget/policy constraints',
      execution_status: 'FAILED',
    });

    await db.createAuditLog({
      user_name: req.user?.full_name || 'Supply Chain Manager',
      event_category: 'HUMAN_APPROVAL',
      event_name: 'AI Recommendation Rejected',
      input_context_summary: `Decision ID ${decisionId} rejected. Reason: ${reason || 'N/A'}`,
      decision_summary: `Recommendation for ${decision.selected_action_title} was declined.`,
      action_taken: 'Autonomous dispatch aborted. Maintained baseline passive monitoring.',
      approval_status: 'REJECTED',
    });

    const io = req.app.get('io');
    if (io) {
      const updated = await db.getDecisionById(decisionId);
      io.emit('decision:updated', updated);
    }

    res.json({ success: true, message: 'AI Action rejected.', data: { decisionId, status: 'REJECTED' } });
  } catch (err) {
    next(err);
  }
};

/**
 * Configure Autonomous Mode: AUTONOMOUS, ASSISTED, MANUAL_APPROVAL
 */
const configureMode = async (req, res, next) => {
  try {
    const { mode, autoApprovalThresholdInr } = req.body;
    const updated = supplyChainGuardian.setAutonomousMode(mode, autoApprovalThresholdInr);
    res.json({ success: true, message: 'Autonomous agent mode updated', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeDisruption,
  processCommand,
  approveAction,
  rejectAction,
  configureMode,
};
