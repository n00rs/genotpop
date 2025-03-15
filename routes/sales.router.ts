import { Router } from "express";
import { expCallback } from "../libs/common/index.ts";
import {
  createInvoiceController,
  getInvoiceController,
  updateInvoiceController,
  deleteInvoiceController,
  createReceiptController,
  getReceiptController,
  updateReceiptController,
  deleteReceiptController,
} from "../libs/sale/index.ts";
const router = Router();

/**
 * invoice  routes
 */
router.post("/invoice/create_invoice", expCallback(createInvoiceController));
router.post("/invoice/get_invoice", expCallback(getInvoiceController));
router.put("/invoice/update_invoice", expCallback(updateInvoiceController));
router.delete("/invoice/delete_invoice", expCallback(deleteInvoiceController));

/**
 * receipt  routes
 */
router.post("/receipt/create_receipt", expCallback(createReceiptController));
router.post("/receipt/get_receipt", expCallback(getReceiptController));
router.put("/receipt/update_receipt", expCallback(updateReceiptController));
router.delete("/receipt/delete_receipt", expCallback(deleteReceiptController));

export default router;
