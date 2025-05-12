import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

import { Calendar } from '@/components/ui/calendar'
import { formatDate } from '@/lib/formatDate'
import { Button } from '@/components/ui/button'
import { CalendarIcon, EditIcon } from 'lucide-react'

type MediaCalendarProps = {
	date: Date | undefined
	setDate: (date: Date | undefined) => void
	setIsRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export default function MediaCalendar({ date, setDate, setIsRefresh }: MediaCalendarProps) {
	return (
		<div className='flex gap-2 flex-wrap items-center mt-2'>
			<label className='text-md font-medium '>
				Date watched: {date && formatDate(date)}
			</label>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant='default'
						className='mt-[0px] w-fit justify-start text-left cursor-pointer h-auto !p-1'
					>
						{date ? (
							<EditIcon className=' h-4 w-4' />
						) : (
							<>
								<CalendarIcon className='h-4 w-4' />

								<span className='dark:text-black text-white'>
									Pick a date
								</span>
							</>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0'>
					<Calendar
						mode='single'
						selected={date}
						onSelect={newDate => {
							setDate(newDate)
							setIsRefresh(true)
						}}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}