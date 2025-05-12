import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { EditIcon } from 'lucide-react'

type MediaHeaderSelectProps = {
    setIsRefresh: React.Dispatch<React.SetStateAction<boolean>>
    setUserRating: React.Dispatch<React.SetStateAction<number>>
    userRating: number

}


export default function MediaHeaderSelect({setIsRefresh, setUserRating, userRating} : MediaHeaderSelectProps) {
    return (
		<Select
			onValueChange={value => {
				setIsRefresh(true)
				setUserRating(Number(value))
			}}
		>
			<SelectTrigger className='dark:!text-black w-fit bg-black !text-white !p-1 !h-fit cursor-pointer dark:bg-white/50 font-medium '>
				{!userRating || userRating === -69 ? (
					<SelectValue placeholder='Set rating' />
				) : (
					<EditIcon className=' h-4 w-4 dark:text-black text-white' />
				)}
			</SelectTrigger>
			<SelectContent className='w-fit'>
				{Array.from({ length: 10 }).map((_, i) => (
					<SelectItem key={i} value={`${i + 1}`}>
						{i + 1}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}