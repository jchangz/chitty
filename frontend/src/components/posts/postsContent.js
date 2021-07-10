import React from 'react';
import PostsTags from './postsTags';
import '../../App.css';

const PostsContent = React.memo(({ item, deletePost }) => {
  return (
    <div className="container-item">
      <p>{item.name}</p>
      <img
        src={item.image}
        alt=""
      />
      <button onClick={() => deletePost(item)}>Delete</button>
      <PostsTags
        id={item.id}
        currentTags={item.tags ? item.tags : []}
      />
    </div>
  )
})

export default PostsContent;
