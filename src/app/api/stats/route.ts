import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/stats — dashboard stats (ADMIN only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      pendingArticles,
      totalUsers,
      totalViews,
      recentArticles,
      recentLogs,
      topArticles,
      categories,
    ] = await Promise.all([
      db.article.count(),
      db.article.count({ where: { status: "PUBLISHED" } }),
      db.article.count({ where: { status: "DRAFT" } }),
      db.article.count({ where: { status: "PENDING_REVIEW" } }),
      db.user.count({ where: { isActive: true } }),
      db.article.aggregate({ _sum: { views: true } }),
      db.article.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      db.systemLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.article.findMany({
        take: 5,
        orderBy: { views: "desc" },
        select: {
          title: true,
          views: true,
        },
      }),
      db.category.findMany({
        select: {
          name: true,
          _count: {
            select: { articles: true },
          },
        },
      }),
    ]);

    const categoriesBreakdown = categories.map((c) => ({
      name: c.name,
      count: c._count.articles,
    }));

    return NextResponse.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      pendingArticles,
      totalUsers,
      totalViews: totalViews._sum.views || 0,
      recentArticles: recentArticles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        status: a.status,
        createdAt: a.createdAt,
        author: a.author,
        category: a.category,
      })),
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        action: log.action,
        userId: log.userId,
        userName: log.user?.name || "System",
        details: log.details,
        createdAt: log.createdAt,
      })),
      topArticles,
      categoriesBreakdown,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
