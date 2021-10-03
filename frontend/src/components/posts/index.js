import React, { useState, useEffect, useRef } from 'react';
import { usePostsDispatch, usePostsState, getPosts, useSelectionsState } from '../../context';
import PostsContent from './postsContent'
import MouseDragSelect from '../../helpers/mouseDragSelect'
import DragReorder from '../../helpers/dragReorder'

function Posts() {
  const { posts, update } = usePostsState()
  const dispatchPosts = usePostsDispatch()
  const { selectedItemsID } = useSelectionsState()
  const [postsList, setPostsList] = useState(null)
  const contentRef = useRef(null) // Ref is used to pass nodes to MouseDragSelect
  const { dragging, transform, highlight, onDrop, onDragLeave } = DragReorder(contentRef, postsList)

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

  function onDragEnter(e) {
    e.preventDefault();
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  return (
    <MouseDragSelect>
      <div
        className={`post-container ${dragging ? 'stretch' : ''}`}
        ref={contentRef}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        draggable="false"
      >
        {postsList && postsList.map((item, i) => (
          <PostsContent
            item={item}
            key={item.id}
            draggable={selectedItemsID.includes(item.id) ? true : false}
            move={highlight === i && dragging ? 'left' : ((highlight - 1 === (i) && dragging ? 'right' : false))}
            transform={transform ? transform[i] : '0'}
            highlight={selectedItemsID.includes(item.id) ? true : false}
          />
        ))}
      </div>
    </MouseDragSelect>
  );
}

export default Posts;