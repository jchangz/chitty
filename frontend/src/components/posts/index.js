import React, { useState, useEffect, useCallback } from 'react';
import { usePostsDispatch, usePostsState, getPosts } from '../../context';
import PostsContent from './postsContent'

function Posts() {
  const dispatchPosts = usePostsDispatch()
  const { posts, update } = usePostsState()
  const [postsList, setPostsList] = useState(null)

  useEffect(() => {
    getPosts(dispatchPosts)
      .then(collection => setPostsList(collection))
  }, [dispatchPosts])

  useEffect(() => {
    if (update !== 0) {
      setPostsList(posts)
    }
  }, [update, posts])

  const deletePost = useCallback(item => {
    setPostsList(postsList => postsList.filter(items => items.id !== item.id));
  }, []);

  return (
    <div>
      {postsList && postsList.map((item, i) => (
        <PostsContent
          item={item}
          key={item.id}
          deletePost={deletePost}
        />
      ))}
    </div>
  );
}

export default Posts;
