export async function generateMetadata() {
    return {
        title: 'MovieMan: My library',
        description: 'Your personal movie library.',
    }
}
const MyLibrary = async ({ children }: { children: React.ReactNode }) => {
    
    return (
        <>
            {children}
        </>
    )
}

export default MyLibrary
