const Container = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="flex-1 grid grid-cols-4 gap-2">
            {children}
        </div>
    )
}

export default Container