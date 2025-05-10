// app/api/user-lists/route.ts

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 })
	}

	// const list = req.nextUrl.searchParams.get('type')
	//const media = req.nextUrl.searchParams.get('media')

	// let filter = {}

	// if (list === 'watched') {
	// 	filter = { isWatched: true }
	// } else if (list === 'wishlist') {
	// 	filter = { isWishlist: true }
	// } else if (list === 'favorite') {
	// 	filter = { isFavorite: true }
	// } else {
	// 	return new Response('Invalid type', { status: 400 })
	// }

	// const userMedia = await prisma.userMedia.findMany({
	// 	where: {
	// 		userId: session.user.id,
	// 		...filter,
	// 	},
	// })

	// let filter = {}

	const userMedia = await prisma.userMedia.findMany({
		where: {
			userId: session.user.id,
		},
	})

	return Response.json(userMedia)
}
