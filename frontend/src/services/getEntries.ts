import axios from "axios";
import { PatchRiotType } from "../enum/api-riot.unum";
import { Account } from "../enum/account-riot.enum";
import { getSummonetId } from "./getSummonerId";

const proxy = 'https://cors-anywhere.herokuapp.com/';

export const getEntries = async () => {
    const id = await getSummonetId();
    const res  = await axios.get(proxy + `${PatchRiotType.entries}/${id}`, {
        params: {
            api_key: Account.apiKey,
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
    })
    return res.data[0];
}