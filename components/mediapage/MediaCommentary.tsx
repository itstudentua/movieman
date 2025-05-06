'use client'

import { Textarea } from '@/components/ui/textarea'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function ShowCommentary({
	userComment,
	setUserComment,
	handleClick,
	isWatched
}: {
	userComment: string
	setUserComment: React.Dispatch<React.SetStateAction<string>>
	handleClick: () => Promise<void>
	isWatched: boolean
}) {
	const { data: session } = useSession()

	const [text, setText] = useState(userComment || '69proverka')
	const [edit, setEdit] = useState(false)

	const handleSave = () => {
		setEdit(false)
		setUserComment(text)
	}

	useEffect(() => {
		if (userComment === text && text !== '69proverka') {
			handleClick()
		} else {
			setText(userComment || '')
		}
	}, [userComment])

	if (!session?.user) return null

	return (
		<>
			{isWatched && (
				<div className='w-full mt-10 flex flex-col gap-5 border-t-2'>
					<h2 className='text-2xl font-medium mt-5'>My commentary</h2>
					<>
						{edit ? (
							<Textarea
								className='h-50 resize-none p-2'
								value={text}
								onChange={e => setText(e.target.value)}
								disabled={!edit}
							/>
						) : (
							text.trim() !== '' && <p>{text}</p>
						)}

						{edit ? (
							<Button
								className='cursor-pointer w-fit'
								onClick={handleSave}
							>
								Save comment
							</Button>
						) : (
							<Button
								className='cursor-pointer w-fit'
								onClick={() => setEdit(true)}
							>
								{text.trim() !== '' ? 'Edit' : 'Add comment'}
							</Button>
						)}
					</>
				</div>
			)}
		</>
	)
}
