const Container = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="grid grid-cols-4 gap-2 h-full w-full bg-white-200 scrollable ">
            {children}
        </div>
    )
}

export default Container