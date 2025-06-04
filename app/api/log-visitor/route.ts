import { NextRequest, NextResponse } from 'next/server'
import DeviceDetector from 'device-detector-js'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
	const userAgent = req.headers.get('user-agent') || ''
	const detector = new DeviceDetector()
	const result = detector.parse(userAgent)

	const ip =
		req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
	const deviceModel = result.device?.model || 'unknown'
	const brand = result.device?.brand || 'unknown'
	const os = result.os?.name || 'unknown'
	const browser = result.client?.name || 'unknown'
	const deviceName = `${brand} ${deviceModel}`

	// Проверим: есть ли уже такая запись сегодня
	const startOfDay = new Date()
	startOfDay.setHours(0, 0, 0, 0)

	const existing = await prisma.visitor.findFirst({
		where: {
			ip,
			userAgent,
			createdAt: {
				gte: startOfDay,
			},
		},
	})

	if (!existing) {
		await prisma.visitor.create({
			data: {
				ip,
				browser,
				os,
				device: deviceName,
				userAgent,
			},
		})
	}

	return NextResponse.json({ success: true, repeated: !!existing })
}
