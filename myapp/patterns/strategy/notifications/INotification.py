from abc import ABC, abstractmethod

class NotificationInterface(ABC):
    @abstractmethod
    def generate_notification(self):
        pass

