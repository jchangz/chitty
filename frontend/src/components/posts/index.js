import React, { useState, useEffect, useRef } from 'react';
import { usePostsDispatch, usePostsState, getPosts, useSelectionsState } from '../../context';
import PostsContent from './postsContent'
import MouseDragSelect from '../../helpers/mouseDragSelect'

function Posts() {
  const { posts, update } = usePostsState()
  const dispatchPosts = usePostsDispatch()
  const { selectedItemsID } = useSelectionsState()
  const [postsList, setPostsList] = useState(null)
  const [transform, setTransform] = useState(null)
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

  useEffect(() => {
    /**
     * Setup transform property for child items
     */
    if (postsList) {
      const childArray = [...contentRef.current.children]

      const childHash = childArray.reduce((arr, item) => {
        // Create new object with Key (offsetTop): Value (array of item offsetHeights)
        if (item.offsetTop in arr) {
          arr[item.offsetTop].push(item.offsetHeight)
        } else {
          arr[item.offsetTop] = [item.offsetHeight]
        }
        return arr
      }, {})

      const childMap = Object.values(childHash).map(set => {
        // Map new array of each offsetTop with differences between each items height and max offsetHeight in the array
        const maxHeight = Math.max(...set)
        const newArr = set.map(height => {
          return height - maxHeight
        })
        return newArr
      })

      const initialArr = Array(childMap[0].length).fill(0) // Use to initialize reducer

      const childMapAgg = childMap.reduce((arr, item, i) => {
        const newArr = arr[i].map((a, i) => a + item[i])
        arr.push(newArr)
        return arr
      }, [initialArr])

      const childTransform = [].concat(...childMapAgg)

      setTransform(childTransform)
    }
  }, [postsList])

  return (
    <MouseDragSelect>
      <div class="post-container" ref={contentRef}>
        {postsList && postsList.map((item, i) => (
          <PostsContent
            item={item}
            transform={transform && transform[i]}
            highlight={selectedItemsID.includes(item.id) ? true : false}
            key={item.id}
          />
        ))}
      </div>
    </MouseDragSelect>
  );
}

export default Posts;