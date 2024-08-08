from datetime import datetime
import uuid

def get_file_game_path(_instance, filename):
    ext = filename.split('.')[-1]
    now = datetime.now()
    filename = f'{uuid.uuid4()}{now}.{ext}'
    return f"game/{filename}"

def get_file_company_path(_instance, filename):
    ext = filename.split('.')[-1]
    now = datetime.now()
    filename = f'{uuid.uuid4()}{now}.{ext}'
    return f"company/{filename}"

