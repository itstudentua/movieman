import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'


type LibraryTabsComponentProps = {
	activeTab: string
	setActiveTab: (tab: string) => void
	mediaType: string
	setMediaType: (type: string) => void
	userLists: Array<{ id: string; name: string }>
	selectedListId: string
	handleSelectChange: (value: string) => void
}

export default function LibraryTabsComponent({activeTab, setActiveTab, mediaType, setMediaType, userLists, selectedListId, handleSelectChange}: LibraryTabsComponentProps) {
	return (
		<>
			<div className='flex gap-2 items-baseline flex-wrap'>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className='p-0 rounded-sm h-auto gap-3 bg-transparent flex-wrap items-center'>
						<TabsTrigger
							className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
							value='watched'
						>
							Watched
						</TabsTrigger>
						<TabsTrigger
							className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
							value='wishlist'
						>
							WishList
						</TabsTrigger>
						<TabsTrigger
							className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
							value='favorite'
						>
							Favorite
						</TabsTrigger>
					</TabsList>
					<TabsContent value='watched' />
					<TabsContent value='wishlist' />
					<TabsContent value='favorite' />
				</Tabs>

				{userLists.length > 0 && (
					<Select
						value={selectedListId}
						onValueChange={handleSelectChange}
					>
						<SelectTrigger
							className={
								selectedListId
									? 'bg-black text-white dark:bg-white dark:text-black cursor-pointer font-semibold'
									: 'cursor-pointer'
							}
						>
							<SelectValue placeholder='My lists' />
						</SelectTrigger>
						<SelectContent>
							{userLists.map((listItem: any) => (
								<SelectItem
									key={listItem.id}
									value={listItem.id}
									className='cursor-pointer'
								>
									{listItem.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>

			<Tabs
				className='mt-3'
				value={mediaType}
				onValueChange={setMediaType}
			>
				<TabsList className='p-0 rounded-sm h-auto gap-2 bg-transparent'>
					<TabsTrigger
						className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
						value='movie'
					>
						Movie
					</TabsTrigger>
					<TabsTrigger
						className='cursor-pointer hover:opacity-70 px-2 py-1 rounded-sm data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border-black dark:border-white'
						value='tv'
					>
						TV Series
					</TabsTrigger>
				</TabsList>
				<TabsContent value='movie' />
				<TabsContent value='tv' />
			</Tabs>
		</>
	)
}
