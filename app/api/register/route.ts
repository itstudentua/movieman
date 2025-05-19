import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
	const body = await req.json()
	const { login, password, name, surname } = body

	const existingUser = await prisma.user.findUnique({ where: { login } })
	if (existingUser) {
		return NextResponse.json(
			{ error: 'Пользователь уже существует' },
			{ status: 400 }
		)
	}

	const passwordHash = await bcrypt.hash(password, 10)

	const user = await prisma.user.create({
		data: { login, passwordHash, name, surname },
	})

	return NextResponse.json({ user })
}
