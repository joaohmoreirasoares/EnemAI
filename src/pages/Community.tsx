// Na renderização do autor do post:
<div className="flex items-start">
  {post.profiles?.avatar_url ? (
    <img 
      src={post.profiles.avatar_url} 
      alt={`${post.profiles.first_name} ${post.profiles.last_name}`}
      className="w-10 h-10 rounded-full mr-3 object-cover"
    />
  ) : (
    <div className="bg-gray-700 rounded-full p-2 mr-3">
      <User className="h-6 w-6 text-gray-300" />
    </div>
  )}
  {/* ... restante */}
</div>

// Repetir lógica similar para os comentários