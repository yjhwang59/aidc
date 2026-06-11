import { PrismaClient, SlotStatus } from "@prisma/client";
import { addDays, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

const services = [
  {
    slug: "ai-tool-training",
    title: "AI 工具培訓",
    description:
      "協助團隊建立正確的 AI 工具使用習慣，從日常場景出發，讓成員知道何時用、如何用、如何評估成效。",
    durationMin: 60,
    sortOrder: 1,
  },
  {
    slug: "vibe-coding",
    title: "Vibe Coding",
    description:
      "以 AI 輔助開發加速原型與系統建置，讓團隊在短時間內產出可驗證、可迭代的實際成果。",
    durationMin: 60,
    sortOrder: 2,
  },
  {
    slug: "ai-agent",
    title: "AI Agent 工作流",
    description:
      "設計與實作可運行的 Agent 自動化流程，涵蓋任務拆解、權限設計、錯誤處理與人工覆核節點。",
    durationMin: 90,
    sortOrder: 3,
  },
  {
    slug: "ai-roadmap",
    title: "AI 導入藍圖",
    description:
      "評估企業現況，規劃階段性導入策略，建立從試點到規模化的清晰路線圖與衡量指標。",
    durationMin: 60,
    sortOrder: 4,
  },
  {
    slug: "ai-system",
    title: "AI 系統開發",
    description:
      "從需求到落地的系統設計顧問，協助團隊建立可維運的 AI 系統架構。",
    durationMin: 90,
    sortOrder: 5,
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        description: service.description,
        durationMin: service.durationMin,
        sortOrder: service.sortOrder,
        isActive: true,
      },
      create: service,
    });
  }

  if (process.env.SEED_DEMO_SLOTS === "true") {
    const allServices = await prisma.service.findMany();
    const baseDate = addDays(new Date(), 1);

    for (const service of allServices) {
      for (let day = 0; day < 5; day++) {
        const date = addDays(baseDate, day);
        const startAt = setMinutes(setHours(date, 10), 0);
        const endAt = setMinutes(setHours(date, 11), 0);

        const existing = await prisma.availabilitySlot.findFirst({
          where: { serviceId: service.id, startAt },
        });

        if (!existing) {
          await prisma.availabilitySlot.create({
            data: {
              serviceId: service.id,
              startAt,
              endAt,
              status: SlotStatus.AVAILABLE,
            },
          });
        }
      }
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
