import React from 'react'
import PostsTags from './postsTags'
import PostsEdit from './postsEdit'
import '../../App.css'

function PostsContent({ item, highlight }) {
  return (
    <div className="container-item">
      <PostsEdit
        item={item}
        highlight={highlight}
      />
      <p>{item.name}</p>
      <img
        src={item.image}
        alt=""
      />
      <PostsTags
        id={item.id}
        currentTags={item.tags}
      />
    </div>
  )
}

export default React.memo(PostsContent);