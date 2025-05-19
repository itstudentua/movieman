interface Role {
	character: string
}

export interface CastMember {
	id?: number
	name?: string
	roles?: Role[]
	character?: string
	profile_path?: string
	total_episode_count?: number 
}

type CrewMember = {
	id: number
	name: string
	job: 'Director' | 'Writer' | 'Screenplay' | string
}

export interface MediaItem {
	id?: number
	title?: string
	poster_path?: string | null
	overview?: string
	release_date?: string
	first_air_date?: string
	vote_average?: number
	vote_count?: number
	media_type?: string
	runtime?: number | null
	cast?: CastMember[]
	name?: string
	profile_path?: string | null
	known_for?: MediaItem[]
}

export interface CommonMedia {
	id?: number
	mediaId?: number
	overview?: string
	first_air_date?: string
	vote_average?: number
	vote_count?: number
	profile_path?: string | null
	known_for?: MediaItem[]
	poster?: string
	userComment?: string
	description?: string
	rating?: number
	userRating?: number
	type?: string
	watchedDate?: Date | null
	isWatched?: boolean
	isFavorite?: boolean
	isWishlist?: boolean
	year?: number
	genres?: { name: string }[]
	origin_country?: string[]
	number_of_seasons?: number
	number_of_episodes?: number
	in_production?: boolean
	images?: {
		posters?: { file_path: string }[]
		backdrops?: { file_path: string }[]
		logos?: { file_path: string }[]
	}
	last_air_date?: string
	created_by?: { id: number; name: string }[]
	runtime?: number
	credits?: {
		cast?: CastMember[]
		crew: CrewMember[]
	}
	title?: string
	name?: string
	poster_path?: string
	media_type?: string
	release_date?: string
	known_for_department?: string
	cast?: CastMember[]
	recommendations?: {
		results?: Recommendation[]
	}

	original_title?: string
	backdrop_path?: string | null
	character?: string
	tagline?: string
}

interface Recommendation {
	id?: number
	name?: string
	original_title?: string
	backdrop_path?: string | null
	vote_average?: number
	first_air_date?: string
	release_date?: string
	media_type?: 'movie' | 'tv'
	character?: string
	type?: string
}
