import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select'

type Props ={
    category: 'trending' | 'topRated' | 'upcoming'
    setCategory: (val: 'trending' | 'topRated' | 'upcoming') => void
    setIndex: (val: number) => void
    resetAutoSlide: () => void
}

export default function MainPageSelect({category, setCategory, setIndex, resetAutoSlide}: Props ) {
	return (
		<Select
			value={category}
			onValueChange={val => {
				setCategory(val as 'trending' | 'topRated' | 'upcoming')
				setIndex(0)
				resetAutoSlide()
			}}
		>
			<SelectTrigger className='w-fit bg-black text-white border-white/20 cursor-pointer hover:opacity-50'>
				<SelectValue placeholder='Category' />
			</SelectTrigger>
			<SelectContent className='bg-black text-white'>
				<SelectItem value='trending'>🔥 Trending</SelectItem>
				<SelectItem value='topRated'>🏆 Top rated</SelectItem>
				<SelectItem value='upcoming'>🎬 Upcoming</SelectItem>
			</SelectContent>
		</Select>
	)
}
