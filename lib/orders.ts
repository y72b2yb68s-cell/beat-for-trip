import { randomBytes } from "node:crypto";
import { prisma } from "./db";

export const DOWNLOAD_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateDownloadToken(): string {
  return randomBytes(32).toString("hex");
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({ where: { id }, include: { beat: true } });
}

export async function getOrderByDownloadToken(token: string) {
  return prisma.order.findUnique({ where: { downloadToken: token }, include: { beat: true } });
}

export async function getOrderByPaymentId(paymentId: string) {
  return prisma.order.findFirst({ where: { paymentId }, include: { beat: true } });
}
