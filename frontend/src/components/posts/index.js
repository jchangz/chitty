import React, { useState, useEffect } from 'react';
import { usePostsDispatch, usePostsState, getPosts, useSelectionsDispatch, useSelectionsState } from '../../context';
import PostsContent from './postsContent'

function Posts() {
  const { posts, update } = usePostsState()
  const dispatchPosts = usePostsDispatch()
  const { selectedItems, selectedItemsID } = useSelectionsState()
  const dispatchSelections = useSelectionsDispatch()
  const [postsList, setPostsList] = useState(null)

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

  const clearHighlightedItems = (e) => {
    // Remove highlighted item when clicking whitespace 
    if ((e.target === e.currentTarget) && selectedItems.length > 0) {
      dispatchSelections({ type: 'resetSelections' })
    }
  }

  return (
    <div onClick={clearHighlightedItems}>
      {postsList && postsList.map((item, i) => (
        <PostsContent
          item={item}
          highlight={selectedItemsID.includes(item.id) ? true : false}
          key={item.id}
        />
      ))}
    </div>
  );
}

export default Posts;