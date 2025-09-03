import { seedTransactions } from "@/action/seed";

export async function GET() {
    const results = await seedTransactions()
    return Response.json(results)
    
}