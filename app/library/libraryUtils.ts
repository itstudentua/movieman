import { CommonMedia } from '@/lib/movieTypes'


export function filterMediaByTab(data: CommonMedia[], mediaType: string, activeTab: string) {
	return data.filter(obj => {
		if (obj.type !== mediaType) return false

		switch (activeTab) {
			case 'wishlist':
				return obj.isWishlist
			case 'watched':
				return obj.isWatched
			case 'favorite':
				return obj.isFavorite
			default:
				return true
		}
	})
}

export function sortMedia(
	media: CommonMedia[],
	sortOption: string,
	sortOrder: 'asc' | 'desc'
) {
	const sorted = [...media].sort((a, b) => {
		let valA, valB

		switch (sortOption) {
			case 'name':
				valA = a.title || ''
				valB = b.title || ''
				return valA.localeCompare(valB)
			case 'release_date':
				return (a.year ?? 0) - (b.year ?? 0)
			case 'watched_date':
				return (
					new Date(a.watchedDate ?? 0).getTime() -
					new Date(b.watchedDate ?? 0).getTime()
				)
			case 'global_rating':
				return (a.rating ?? 0) - (b.rating ?? 0)
			case 'user_rating':
				return (a.userRating ?? 0) - (b.userRating ?? 0)
			default:
				return 0
		}
	})

	return sortOrder === 'asc' ? sorted : sorted.reverse()
}
