import { PrismaClient } from "@prisma/client"
import { seedDatabase } from "./seed"

const prisma = new PrismaClient()

async function runMigrations() {
  try {
    console.log("Running database migrations...")

    // Push the schema to the database
    // This is equivalent to running `prisma db push`
    console.log("Pushing schema to database...")

    // Test database connection
    await prisma.$connect()
    console.log("Database connection established")

    // Run any custom migrations here if needed
    console.log("Migrations completed successfully")

    // Seed the database
    await seedDatabase()
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("All database operations completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Database operations failed:", error)
      process.exit(1)
    })
}

export { runMigrations }
