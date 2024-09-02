import axios from "axios";
import { PatchRiotType } from "../enum/api-riot.unum";
import { Account } from "../enum/account-riot.enum";
import { getPuuid } from "./getPuuid";

const proxy = 'https://cors-anywhere.herokuapp.com/';

export const getSummonetId = async () => {

    const puuid = await getPuuid();

    const response = await axios.get(proxy + `${PatchRiotType.summoner}/${puuid}`, {
        params: {
            api_key: Account.apiKey,
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
    });
    return response.data.id;
};

export const summonerId = async () => {
    return await getSummonetId();
}