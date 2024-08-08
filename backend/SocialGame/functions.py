#Return a path for profile images
from datetime import datetime
import uuid

#Return a path for profile images
def get_file_profile_path(_instance, filename):
    ext = filename.split('.')[-1]
    now = datetime.now()
    filename = f'{uuid.uuid4()}{now}.{ext}'
    return f"profile/{filename}"
