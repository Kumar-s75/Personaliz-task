import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Check if actors already exist
    const existingActors = await prisma.actor.count()

    if (existingActors === 0) {
      console.log("Seeding actors...")

      const actors = [
        {
          id: "actor_1",
          name: "Sarah Johnson",
          description: "Professional female presenter with warm, friendly voice",
          voiceId: "voice_sarah_001",
          imageUrl: "/images/actors/sarah.jpg",
        },
        {
          id: "actor_2",
          name: "Michael Chen",
          description: "Energetic male presenter perfect for tech and business content",
          voiceId: "voice_michael_002",
          imageUrl: "/images/actors/michael.jpg",
        },
        {
          id: "actor_3",
          name: "Emma Rodriguez",
          description: "Bilingual presenter with clear articulation and professional tone",
          voiceId: "voice_emma_003",
          imageUrl: "/images/actors/emma.jpg",
        },
        {
          id: "actor_4",
          name: "David Thompson",
          description: "Experienced narrator with deep, authoritative voice",
          voiceId: "voice_david_004",
          imageUrl: "/images/actors/david.jpg",
        },
        {
          id: "actor_5",
          name: "Lisa Park",
          description: "Youthful and engaging presenter ideal for lifestyle content",
          voiceId: "voice_lisa_005",
          imageUrl: "/images/actors/lisa.jpg",
        },
      ]

      for (const actor of actors) {
        await prisma.actor.create({
          data: actor,
        })
      }

      console.log(`Seeded ${actors.length} actors`)
    } else {
      console.log(`Database already has ${existingActors} actors, skipping seed`)
    }

    console.log("Database seeding completed successfully")
  } catch (error) {
    console.error("Database seeding failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { seedDatabase }
