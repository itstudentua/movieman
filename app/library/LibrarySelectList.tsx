import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'


export default function LibrarySelectedList({setSortOption}: {setSortOption: (value: string) => void}) {
	return (
		<Select
			defaultValue='name'
			onValueChange={value => setSortOption(value)}
		>
			<SelectTrigger className='w-fit cursor-pointer'>
				<SelectValue placeholder='Sort by' />
			</SelectTrigger>
			<SelectContent>
				<SelectItem className='cursor-pointer' value='name'>
					Name
				</SelectItem>
				<SelectItem className='cursor-pointer' value='release_date'>
					Release date
				</SelectItem>
				<SelectItem className='cursor-pointer' value='watched_date'>
					Watched date
				</SelectItem>
				<SelectItem className='cursor-pointer' value='global_rating'>
					Global rating
				</SelectItem>
				<SelectItem className='cursor-pointer' value='user_rating'>
					My rating
				</SelectItem>
			</SelectContent>
		</Select>
	)
}
