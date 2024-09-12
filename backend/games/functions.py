from datetime import datetime
import uuid

def get_file_game_path(_instance, filename):
    """
    Esta função é responsável por criar um nome de arquivo e um caminho para os o **icone** e o **banner** dos jogos. 

    Ela recebe o nome do arquivo, pega a extensão do arquivo e então gera um outro nome único utilizando a lib uuid + a data do arquivo e adiciona a extensão

    Então ela retorna o caminho correto para salvar aquele arquivo específico
    """
    ext = filename.split('.')[-1]
    now = datetime.now()
    filename = f'{uuid.uuid4()}{now}.{ext}'
    return f"game/{filename}"

def get_file_company_path(_instance, filename):
    """
    Esta função é responsável por criar um nome de arquivo e um caminho para os o **icone** e o **banner** das empresas de games. 

    Ela recebe o nome do arquivo, pega a extensão do arquivo e então gera um outro nome único utilizando a lib uuid + a data do arquivo e adiciona a extensão

    Então ela retorna o caminho correto para salvar aquele arquivo específico

    ``ext = filename.split('.')[-1]
    now = datetime.now()
    filename = f'{uuid.uuid4()}{now}.{ext}'
    return f'company/{filename}'``
    """
    ext = filename.split('.')[-1]
    now = datetime.now()
    filename = f'{uuid.uuid4()}{now}.{ext}'
    return f"company/{filename}"

