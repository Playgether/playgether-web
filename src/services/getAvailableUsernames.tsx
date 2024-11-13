import { api } from "./api";

export const getAvailableUsernames = async (username) => {

    try{
        const result = await api.get(`/api/v1/users/${username}/usernames/`, {
        })
        return result.data
    } catch (error) {
        return console.log(error.toJSON());
    }
};