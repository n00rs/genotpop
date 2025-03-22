
import { createStockController } from "../stock/createStock.controller.ts";
import { getStockController } from "../stock/getStock.controller.ts";
import { updateStockController } from "../stock/updateStock.controller.ts";
import { deleteStockController } from "../stock/deleteStock.controller.ts";
import { createStockCategoryController } from "../category/createCategory.controller.ts";
import { getStockCategoryController } from "../category/getCategory.controller.ts";
import { updateStockCategoryController } from "../category/updateCategory.controller.ts";
import { deleteStockCategoryController } from "../category/deleteCategory.controller.ts";


const createStockInventoryController = async ({ body, ...source }) => {
  console.log({ body, source });
  return {};
};
const getStockInventoryController = async ({ body, ...source }) => {
  console.log({ body, source });
  return {};
};
const updateStockInventoryController = async ({ body, ...source }) => {
  console.log({ body, source });
  return {};
};
const deleteStockInventoryController = async ({ body, ...source }) => {
  console.log({ body, source });
  return {};
};

export {
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
};
