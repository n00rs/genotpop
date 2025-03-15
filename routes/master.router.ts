import { Router } from "express";

import { expCallback } from "../libs/common/index.ts";

import {
    createStockController,
    getStockController,
    updateStockController,
    deleteStockController,
    createStockCategoryController,
    getStockCategoryController,
    updateStockCategoryController,
    deleteStockCategoryController,
    createStockInventoryController,
    getStockInventoryController,
    updateStockInventoryController,
    deleteStockInventoryController,
  } from "../libs/inventory/index.ts";
  import {
    createCustomerController,
    deleteCustomerController,
    getCustomerController,
    updateCustomerController,
  } from "../libs/customer/index.ts";


const router = Router();
/**
 * stock routes
 */
router.post("/stock/create_stock",expCallback(createStockController));
router.put("/stock/update_stock",expCallback(updateStockController));
router.post("/stock/get_stock",expCallback(getStockController));
router.delete("/stock/delete_stock",expCallback(deleteStockController));
/**
 * stock category routes
 */
router.post("/stock/create_category",expCallback(createStockCategoryController));
router.post("/stock/get_category",expCallback(getStockCategoryController));
router.put("/stock/update_category",expCallback(updateStockCategoryController));
router.delete("/stock/delete_category",expCallback(deleteStockCategoryController));
/**
 * stock inventory routes
 */
router.post("/stock/create_inventory",expCallback(createStockInventoryController));
router.post("/stock/get_inventory",expCallback(getStockInventoryController));
router.put("/stock/update_inventory",expCallback(updateStockInventoryController));
router.delete("/stock/delete_inventory",expCallback(deleteStockInventoryController));
/**
 * Customer routes
 */
router.post("/customer/create_customer",expCallback(createCustomerController));
router.post("/customer/get_customer",expCallback(getCustomerController));
router.put("/customer/update_customer",expCallback(updateCustomerController));
router.delete("/customer/delete_customer",expCallback(deleteCustomerController));



export default router;
