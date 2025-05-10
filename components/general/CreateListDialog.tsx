// app/components/CreateListDialog.tsx
'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner' // Импортируем toast

export function CreateListDialog({
	open,
	setOpen,
	handleListCreated,
	listMutate,
}: {
	open: boolean
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	handleListCreated: () => Promise<void>
	listMutate: () => Promise<void>
}) {
	const [listName, setListName] = useState('')
	const { data: session } = useSession()

	const handleCreate = async () => {
		if (!listName.trim() || !session?.user) return
		setOpen(false)

		const res = await fetch('/api/lists/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: listName,
				userId: session.user.id,
			}),
		})

		if (res.ok) {
			toast.success('Success!')
			setListName('')
			handleListCreated()
		} else if (res.status === 409) {
			toast.error('List with such name already exists')
		} else {
			toast.error('Error!')
		}
		listMutate()
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create new list</DialogTitle>
					<DialogDescription>
						Enter name of the list
					</DialogDescription>
				</DialogHeader>

				<Input
					placeholder='List name'
					value={listName}
					onChange={e => setListName(e.target.value)}
				/>

				<DialogFooter>
					<Button className='cursor-pointer' onClick={handleCreate}>Create</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
