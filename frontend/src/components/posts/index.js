import React, { useState, useEffect, useRef } from 'react';
import { usePostsDispatch, usePostsState, getPosts, useSelectionsState } from '../../context';
import PostsContent from './postsContent'
import MouseDragSelect from '../../helpers/mouseDragSelect'

function Posts() {
  const { posts, update } = usePostsState()
  const dispatchPosts = usePostsDispatch()
  const { selectedItemsID } = useSelectionsState()
  const [postsList, setPostsList] = useState(null)
  const contentRef = useRef(null) // Ref is used to pass nodes to MouseDragSelect

  useEffect(() => {
    // Set initial posts list
    getPosts(dispatchPosts)
      .then(collection => setPostsList(collection))
  }, [dispatchPosts])

  useEffect(() => {
    if (update !== 0) {
      setPostsList(posts)
    }
  }, [update, posts])

  return (
    <MouseDragSelect>
      <div ref={contentRef}>
        {postsList && postsList.map((item, i) => (
          <PostsContent
            dataId={i}
            item={item}
            highlight={selectedItemsID.includes(item.id) ? true : false}
            key={item.id}
          />
        ))}
      </div>
    </MouseDragSelect>
  );
}

export default Posts;