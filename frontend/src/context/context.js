import { createContext, useReducer, useContext } from 'react'
import { postsReducer, tagsReducer, selectionsReducer } from './reducer'

export const SelectionsDispatchContext = createContext({})
export const SelectionsStateContext = createContext({})
export const PostsStateContext = createContext({})
export const PostsDispatchContext = createContext({})
export const TagsDispatchContext = createContext({})
export const TagsStateContext = createContext({})

export const useSelectionsState = () => {
  const selectionsState = useContext(SelectionsStateContext);
  if (!selectionsState) {
    throw new Error('useSelectionsState must be used within SelectionsProvider');
  }
  return selectionsState;
}

export const useSelectionsDispatch = () => {
  const selectionsDispatch = useContext(SelectionsDispatchContext);
  if (!selectionsDispatch) {
    throw new Error('useSelectionsDispatch must be used within SelectionsProvider');
  }
  return selectionsDispatch;
}

export const usePostsState = () => {
  const postsState = useContext(PostsStateContext);
  if (!postsState) {
    throw new Error('usePostsState must be used within PostsProvider');
  }
  return postsState;
}

export const usePostsDispatch = () => {
  const postsDispatch = useContext(PostsDispatchContext);
  if (!postsDispatch) {
    throw new Error('usePostsDispatch must be used within PostsProvider');
  }
  return postsDispatch;
}

export const useTagsState = () => {
  const tagsState = useContext(TagsStateContext);
  if (!tagsState) {
    throw new Error('useTagsState must be used within TagsProvider');
  }
  return tagsState;
}

export const useTagsDispatch = () => {
  const tagsDispatch = useContext(TagsDispatchContext);
  if (!tagsDispatch) {
    throw new Error('useTagsDispatch must be used within TagsProvider');
  }
  return tagsDispatch;
}

export const SelectionsProvider = ({ children }) => {
  const [selections, dispatch] = useReducer(selectionsReducer, { selectedItems: [], selectedItemsID: [] })

  return (
    <SelectionsStateContext.Provider value={selections}>
      <SelectionsDispatchContext.Provider value={dispatch}>
        {children}
      </SelectionsDispatchContext.Provider>
    </SelectionsStateContext.Provider>
  )
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