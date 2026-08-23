// ============================================================
// PRODEXA AI — Unified API Service Layer
// ============================================================

import { catalogStore } from "./catalogStore";
import type { Product, DashboardStats, ProcessingJob } from "../types/prodexa";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getDashboardStats = async (datasetId?: string): Promise<DashboardStats> => {
  await delay(150);
  return catalogStore.getDashboardStats(datasetId);
};

export const getProducts = async (datasetId?: string): Promise<Product[]> => {
  await delay(150);
  return catalogStore.getProducts(datasetId);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  await delay(100);
  return catalogStore.getProductById(id);
};

export const getCurrentProduct = async (): Promise<Product | undefined> => {
  await delay(80);
  return catalogStore.getCurrentProduct();
};

export const uploadDocument = async (
  file: File,
  fileContent: string,
  mappings?: any[]
): Promise<{ datasetId: string; fileName: string; productCount: number; job: ProcessingJob }> => {
  await delay(400);
  const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  const ext = file.name.split(".").pop()?.toUpperCase() || "CSV";

  const { dataset, job, products } = catalogStore.ingestDataset(
    file.name,
    sizeStr,
    ext,
    fileContent,
    mappings
  );

  return {
    datasetId: dataset.id,
    fileName: dataset.fileName,
    productCount: products.length,
    job,
  };
};

export const runAIProcessingPipeline = async (_datasetId: string): Promise<{ jobId: string; status: string }> => {
  await delay(200);
  return { jobId: "job_" + Date.now(), status: "completed" };
};

export const resolveConflict = async (
  conflictId: string,
  acceptedValue: string,
  user: string = "Data Architect"
): Promise<{ success: boolean; resolvedValue: string }> => {
  await delay(150);
  const ok = catalogStore.resolveConflict(conflictId, acceptedValue, user);
  return { success: ok, resolvedValue: acceptedValue };
};

export const recoverMissingAttribute = async (
  productId: string,
  attributeName: string
): Promise<{ success: boolean }> => {
  await delay(300);
  const ok = catalogStore.recoverMissingAttribute(productId, attributeName);
  return { success: ok };
};

export const handleDuplicateGroup = async (
  groupId: string,
  action: "merge" | "keep" | "dismiss"
): Promise<{ success: boolean }> => {
  await delay(200);
  const ok = catalogStore.handleDuplicateGroup(groupId, action);
  return { success: ok };
};
