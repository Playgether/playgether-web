from abc import ABC, abstractmethod

class NotificationInterface(ABC):
    @abstractmethod
    def get_notification(self):
        pass