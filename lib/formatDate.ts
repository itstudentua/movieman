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
