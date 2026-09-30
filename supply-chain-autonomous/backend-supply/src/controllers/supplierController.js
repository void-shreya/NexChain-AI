const { db } = require('../database/dbClient');

const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await db.getSuppliers();
    const products = await db.getProducts();

    // Attach products supplied to each supplier
    const enriched = suppliers.map((sup) => {
      const suppliedProducts = products.filter((p) => p.primary_supplier_id === sup.id);
      return {
        ...sup,
        products_supplied_count: suppliedProducts.length,
        products_supplied: suppliedProducts.map((p) => ({ id: p.id, sku: p.sku, name: p.name, category: p.category })),
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await db.getSupplierById(id);
    if (!supplier) {
      return res.status(404).json({ success: false, error: 'Supplier not found' });
    }

    const products = await db.getProducts();
    const suppliedProducts = products.filter((p) => p.primary_supplier_id === supplier.id);

    res.json({
      success: true,
      data: {
        ...supplier,
        products_supplied: suppliedProducts,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateSupplierStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, risk_level } = req.body;
    const updated = await db.updateSupplier(id, { status, risk_level });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Supplier not found' });
    }
    res.json({ success: true, message: 'Supplier updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  updateSupplierStatus,
};
