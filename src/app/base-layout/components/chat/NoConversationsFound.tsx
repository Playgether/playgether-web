function NoConversationsFound({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <span className="text-3xl text-white">💬</span>
      </div>
      <p className="text-muted-foreground text-center text-lg font-medium">
        {message}
      </p>
    </div>
  );
}

export default NoConversationsFound;
