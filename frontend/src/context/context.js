import { createContext, useReducer, useContext } from 'react'
import { postsReducer, tagsReducer } from './reducer'

export const PostsStateContext = createContext({})
export const PostsDispatchContext = createContext({})
export const TagsDispatchContext = createContext({})
export const TagsStateContext = createContext({})

export const usePostsState = () => {
  const fruitsState = useContext(PostsStateContext);
  if (!fruitsState) {
    throw new Error('usePostsState must be used within PostsProvider');
  }
  return fruitsState;
}

export const usePostsDispatch = () => {
  const fruitsState = useContext(PostsDispatchContext);
  if (!fruitsState) {
    throw new Error('usePostsDispatch must be used within PostsProvider');
  }
  return fruitsState;
}

export const useTagsState = () => {
  const fruitsState = useContext(TagsStateContext);
  if (!fruitsState) {
    throw new Error('useTagsState must be used within TagsProvider');
  }
  return fruitsState;
}

export const useTagsDispatch = () => {
  const fruitsState = useContext(TagsDispatchContext);
  if (!fruitsState) {
    throw new Error('useTagsDispatch must be used within TagsProvider');
  }
  return fruitsState;
}

export const PostsProvider = ({ children }) => {
  const [posts, dispatch] = useReducer(postsReducer, { posts: [], update: 0 })

  return (
    <PostsStateContext.Provider value={posts}>
      <PostsDispatchContext.Provider value={dispatch}>
        {children}
      </PostsDispatchContext.Provider>
    </PostsStateContext.Provider>
  )
}

export const TagsProvider = ({ children }) => {
  const [tags, dispatch] = useReducer(tagsReducer, { tags: [] })

  return (
    <TagsStateContext.Provider value={tags}>
      <TagsDispatchContext.Provider value={dispatch}>
        {children}
      </TagsDispatchContext.Provider>
    </TagsStateContext.Provider>
  )
}