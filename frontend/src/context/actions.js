export const getTags = async (dispatch) => {
    const response = await fetch("http://localhost:4000/tags")
    const collection = await response.json()
    if (response.ok) {
        dispatch({ type: 'setTags', tags: collection })
        return collection
    }
}

export const getPosts = async (dispatch) => {
    const response = await fetch("http://localhost:4000/collection")
    const collection = await response.json()
    if (response.ok) {
        dispatch({ type: 'setPosts', posts: collection, update: 0 })
        return collection
    }
}

export const getPostUpdate = async (id) => {
    const response = await fetch("http://localhost:4000/collection/update?id=" + id)
    const collection = await response.json()
    if (response.ok) {
        return collection
    }
}