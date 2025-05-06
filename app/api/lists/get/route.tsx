// /app/api/lists/get/route.ts (или .ts, в зависимости от структуры)
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // путь к твоему Prisma клиенту

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url)
		const userId = searchParams.get('userId')

		if (!userId) {
			return NextResponse.json(
				{ error: 'Missing userId' },
				{ status: 400 }
			)
		}

		const lists = await prisma.userList.findMany({
			where: { userId },
			include: {
				items: true,
			},
		})

		return NextResponse.json(lists)
	} catch (error) {
		console.error('Error fetching lists:', error)
		return NextResponse.json({ error: 'Internal error' }, { status: 500 })
	}
}
