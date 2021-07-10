export const postsReducer = (state, action) => {
    switch (action.type) {
        case 'setPosts':
            return { ...state, posts: action.posts, update: action.update }
        default:
            throw new Error()
    }
}

export const tagsReducer = (state, action) => {
    switch (action.type) {
        case 'setTags':
            return { ...state, tags: action.tags }
        default:
            throw new Error()
    }
}