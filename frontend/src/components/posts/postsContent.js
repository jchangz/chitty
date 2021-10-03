import React from 'react'
import PostsTags from './postsTags'
import PostsEdit from './postsEdit'
import '../../App.css'

function PostsContent({ item, highlight, transform, move, draggable }) {
  return (
    <div
      className="container-item"
      draggable={draggable}
      style={{ transform: `translateY(${transform}px)` }}>
      {move && (<div className={"thing-" + `${move}`} />)}
      <img
        src={item.image}
        alt=""
      />
      <PostsEdit
        item={item}
        highlight={highlight}
      />
      <p>{item.name}</p>
      {/* <PostsTags
        id={item.id}
        currentTags={item.tags}
      /> */}
    </div>
  )
}

export default React.memo(PostsContent);