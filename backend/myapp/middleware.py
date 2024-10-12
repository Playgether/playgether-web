import re

class AcceptRangesMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.media_url_pattern = re.compile(r'/media/.*\.(mp4|webm|mkv|avi)$')

    def __call__(self, request):
        response = self.get_response(request)

        if self.media_url_pattern.match(request.path):
            response["Accept-Ranges"] = "bytes"

        return response