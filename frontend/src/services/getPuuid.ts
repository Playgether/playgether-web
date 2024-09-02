import axios from "axios";
import { PatchRiotType } from "../enum/api-riot.unum";
import { Account } from "../enum/account-riot.enum";

const proxy = 'https://cors-anywhere.herokuapp.com/';
const targetUrl = `${PatchRiotType.account}/${Account.nickname}/${Account.tag}`;

export const getAccountData = async (retries = 3, delay = 1000) => {
    try {
        const response = await axios.get(proxy + targetUrl, {
            params: {
                api_key: Account.apiKey,
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 429 && retries > 0) {
            console.warn(`Limite de requisições atingido. Tentando novamente em ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            return getAccountData(retries - 1, delay * 2); // Retry com atraso exponencial
        } else {
            throw error; // Se o erro não for 429 ou as tentativas acabarem, lance o erro
        }
    }
}

export const getPuuid = async () => {
    const puuid = await getAccountData();
    return puuid.puuid
}