import { format } from 'date-fns'

export const formatDate = (date: string | Date | undefined) => {
	if (!date) return '–'
	try {
		const parsedDate = new Date(date)
		parsedDate.setHours(0, 0, 0, 0) // убираем время
		return format(parsedDate, 'dd.MM.yyyy')
	} catch {
		return '–'
	}
}
export function formatPersonDates(birthday?: string, deathday?: string, isBirth = true) {
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('en-US', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		})
	}

	const calculateAge = (birth: string, end?: string) => {
		const birthDate = new Date(birth)
		const finalDate = end ? new Date(end) : new Date()

		let age = finalDate.getFullYear() - birthDate.getFullYear()
		const monthDiff = finalDate.getMonth() - birthDate.getMonth()
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && finalDate.getDate() < birthDate.getDate())
		) {
			age--
		}
		return age
	}

	const birthText = birthday
		? deathday
			? `${formatDate(birthday)}`
			: `${formatDate(birthday)}, ${calculateAge(
					birthday
			  )} years`
		: `Unknown`

	const deathText = deathday
		? `${formatDate(deathday)}, ${calculateAge(
				birthday!,
				deathday
		  )} years`
		: null

	return isBirth ? birthText : deathText
}
