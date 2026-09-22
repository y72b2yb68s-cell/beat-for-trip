import { prisma } from "@/lib/db";

export async function listRecentOrders(limit = 10) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { beat: { select: { title: true } } },
  });
}

export async function getDashboardStats() {
  const [totalBeats, publishedBeats, totalOrders, paidOrders, revenue] = await Promise.all([
    prisma.beat.count(),
    prisma.beat.count({ where: { status: "published" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.order.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
  ]);

  return {
    totalBeats,
    publishedBeats,
    totalOrders,
    paidOrders,
    revenue: revenue._sum.amount ?? 0,
  };
}

export async function listAdminOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { beat: { select: { title: true } } },
  });
}

export type AdminOrder = Awaited<ReturnType<typeof listAdminOrders>>[number];

export async function getAdminOrderById(id: string) {
  return prisma.order.findUnique({ where: { id } });
}
