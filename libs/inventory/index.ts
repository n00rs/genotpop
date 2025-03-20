
import { createStockController } from "../stock/createStock.controller.ts";
import { getStockController } from "../stock/getStock.controller.ts";
import { updateStockController } from "../stock/updateStock.controller.ts";
import { deleteStockController } from "../stock/deleteStock.controller.ts";

const createStockCategoryController = async ({ body, ...source }) => {
  console.log({ body, source });
  return {};
};
const getStockCategoryController = async ({ body, ...source }) => {
  console.log({ body, source });
  return {};
};
const updateStockCategoryController = async ({ body, ...source }) => {
  console.log({ body, source });
  return {};
};
const deleteStockCategoryController = async ({ body, ...source }) => {
  console.log({ body, source });
  return {};
};

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
