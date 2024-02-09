const Container = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="lg:grid lg:grid-cols-4 gap-2 h-full w-full bg-white-200 scrollable hidden">
            {children}
        </div>
    )
}

export default Container