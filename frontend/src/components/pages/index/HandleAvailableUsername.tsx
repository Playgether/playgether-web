import { getAvailableUsernames } from "../../../services/getAvailableUsernames";


const HandleAvailableUsernames = async (username, errors, setAvailableUsernameResult) => {
    if (!username) {
        setAvailableUsernameResult(<span className="text-red-400 text-xs">Digite um nome de usuário para ser testado</span>)
        } 
        if (errors.username) {
            setAvailableUsernameResult(<span className="text-red-400 text-xs">Corrija os erros acima antes de testar</span>)
        }
        const result = await getAvailableUsernames(username);
        if (result == true) {
            setAvailableUsernameResult(<span className="text-red-400 text-xs">Nome de usuário já em uso</span>)
        } else {
            setAvailableUsernameResult(<span className="text-green-400 text-xs">Nome de usuário disponível</span>)
        }
};

export default HandleAvailableUsernames;
    
    
