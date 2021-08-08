export const selectionsReducer = (state, action) => {
    switch (action.type) {
        case 'setSelectedItems':
            const selectedItemsID = action.selectedItems.map(item => item.id)
            return { ...state, selectedItems: action.selectedItems, selectedItemsID: selectedItemsID }
        case 'resetSelections':
            return { ...state, selectedItems: [], selectedItemsID: [] }
        default:
            throw new Error()
    }
}

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