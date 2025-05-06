// app/api/lists/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Путь к твоему Prisma клиенту
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // Путь к настройкам NextAuth

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)

	// Если сессия не найдена, возвращаем ошибку 401
	if (!session?.user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { name } = await req.json()

	// Проверка на наличие имени списка
	if (!name || typeof name !== 'string') {
		return NextResponse.json({ error: 'Name is required' }, { status: 400 })
	}

	try {
		// Проверка на существование списка с таким же именем у текущего пользователя
		const existing = await prisma.userList.findFirst({
			where: {
				userId: session.user.id,
				name: name.trim(),
			},
		})

		if (existing) {
			return NextResponse.json(
				{ error: 'Список с таким именем уже существует' },
				{ status: 409 } // Статус 409 — конфликт
			)
		}

		// Создание нового списка в базе данных
		const newList = await prisma.userList.create({
			data: {
				name: name.trim(),
				userId: session.user.id,
			},
		})

		return NextResponse.json(newList, { status: 201 })
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: 'Server error' }, { status: 500 })
	}
}
