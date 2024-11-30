const Container = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="grid grid-cols-[1fr_600px_1fr] gap-4">
            {children}
        </div>
    )
}

export default Container