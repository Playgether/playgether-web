type UserNameProps = {
    resource: {
        created_by_user_name: string;
    }
}

const UserNamePost = ({resource}:UserNameProps) => {
    return (
        <div className="text-center mt-5 ml-3">
            <h1 className="text-orange-500">{resource?.created_by_user_name}</h1>
            <p className="text-black-200 opacity-30 text-sm">2 hours ago</p>
        </div> 
    )
}

export default UserNamePost;