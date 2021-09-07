import React from 'react'
import PostsTags from './postsTags'
import PostsEdit from './postsEdit'
import '../../App.css'

function PostsContent({ item, highlight, transform }) {
  return (
    <div className="container-item" style={{ transform: `translateY(${transform}px)` }}>
      <img
        src={item.image}
        alt=""
      />
      <PostsEdit
        item={item}
        highlight={highlight}
      />
      <p>{item.name}</p>
      <PostsTags
        id={item.id}
        currentTags={item.tags}
      />
    </div>
  )
}

export default React.memo(PostsContent);