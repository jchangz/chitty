import React, { useState, useRef, useEffect } from 'react';
import OutsideClickHandler from '../../helpers/outsideClickHandler'
import { useTagsState, usePostsState, usePostsDispatch, useTagsDispatch, getTags, getPostUpdate } from '../../context'
import './tags.css';

function TagsTypeahead({ id, currentTags, setError, setEditState }) {
  const { tags } = useTagsState()
  const { posts, update } = usePostsState()
  const dispatchTags = useTagsDispatch()
  const dispatchPosts = usePostsDispatch()

  const [inputValue, setInputValue] = useState("") // Input value for tag input
  const [suggested, setSuggested] = useState() // Suggested tag
  const [stagedTags, setStagedTags] = useState([]) // Array of staged tags
  const [confirmTag, setConfirmTag] = useState(false) // If suggested tag, confirm between suggested tag and inputted tag
  const form = useRef(null)
  const inputRef = useRef(null)

  const submitForm = async (e) => {
    e.preventDefault();
    const formData = new FormData(form.current)
    formData.append("item_id", id); // Add item_id
    formData.append("staged_tags", stagedTags); // Add stagedTags to be added
    const response = await fetch("http://localhost:4000/tags/editPost", {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      setEditState(false) // Close edit state on repsonse
      getTags(dispatchTags)
      getPostUpdate(id).then(item => {
        const postIndex = posts.findIndex(res => res.id === id)
        const updatedPosts = [...posts]
        updatedPosts[postIndex] = item[0]
        dispatchPosts({ type: 'setPosts', posts: updatedPosts, update: update + 1 })
      })
      return response
    }
    else {
      // var body = await response.text();
    }
  }

  useEffect(() => {
    /**
     * Set focus on input element when adding tags
     * Remove suggested tag when adding tags
     */
    inputRef.current.focus();
    setSuggested(false)
  }, [stagedTags]);

  const onChangeInput = (e) => {
    /**
     * Check each input value
     * Only allow lowercase and prevent special characters
     */
    const inputValue = (e.target.value).toLowerCase();
    const invalidChars = /[^a-zA-Z0-9 ]/g;

    if (inputValue.match(invalidChars)) { // Non valid input
      e.preventDefault()
      setError("'" + e.nativeEvent.data + "' is not valid")
    } else {
      /**
       * Sort existing tags for suggested
       * Get tags that start with the same input, and are not in staged or existing tags
       * Sort by tag popularity or percentage of input relative to tag length
       * Show suggested tag if it exists
       */
      setInputValue(inputValue)
      const isSuggestedTags = tags
        .filter(item => item.name.indexOf(inputValue) === 0 && !currentTags.some(currentTag => currentTag.name === item.name) && !stagedTags.includes(item.name))
        .map(itemz => { return { ...itemz, length: inputValue.length / itemz.name.length } })
        .sort(function (a, b) {
          return parseInt(b.count) - parseInt(a.count) || b.length - a.length
        })

      if (isSuggestedTags.length > 0) {
        setSuggested(isSuggestedTags[0].name)
      } else {
        setSuggested(false)
      }
    }
  }

  const handleEnter = (e) => {
    if (e.keyCode === 32) { // Prevent space key
      e.preventDefault()
      setError("Space is not valid")
    }
    if (e.keyCode === 13) { // On enter key
      e.preventDefault()
      if (inputValue === "") { // No empty tags
        setError("Tag can't be empty")
      } else {
        if (suggested) { // If suggested tag, and it doesnt equal the input - show suggested option, otherwise call setTag
          if (suggested === inputValue) {
            setTag(inputValue)
          } else {
            setConfirmTag([suggested, inputValue])
          }
        } else {
          setTag(inputValue)
        }
      }
    }
  }

  const updateConfirmTag = (e) => {
    /**
     * Update current tags array
     * Reset input value
     * Remove confirm tag component
     */
    setConfirmTag(false)
    setTag(e.target.textContent)
  }

  const setTag = (tag) => {
    /**
     * Method to add input value (tag) to stagedTags
     * Check if tag exists in staged tags or exising tags for item
     * Add new tag to tag array or set error and refocus on the input
     * Reset input value
     */
    const tagExists = currentTags.some(currentTag => currentTag.name === tag) || stagedTags.includes(tag)
    if (!tagExists && tag !== "") {
      setStagedTags(state => [tag, ...state])
    } else {
      setError("Tag '" + tag + "' exists")
      inputRef.current.focus();
    }
    setInputValue("")
  }

  return (
    <div className="tags-typeahead-container">
      <form
        className="typeahead-form"
        ref={form}
        onSubmit={submitForm}
        autoComplete="off">
        <input
          className="tags-typeahead-input tags-typeahead-tag"
          ref={inputRef}
          value={inputValue}
          onChange={onChangeInput}
          onKeyDown={handleEnter}
          onPaste={(e) => e.preventDefault()}
          type="text"
          name="tag" />
        <div className="typeahead-autocomplete">
          <span className="tags-typeahead-tag">
            {suggested ? suggested : inputValue}
          </span>
        </div>
        {stagedTags.length > 0 ?
          <input
            className="tags-typeahead-submit"
            type="submit" />
          : null
        }
      </form>
      {stagedTags.length > 0 ?
        <div className="tags-typeahead-staged">
          {stagedTags.map((item, i) => (
            <span className="tags-typeahead-tag" key={i}>#{item}</span>
          ))}
        </div> : null}
      {confirmTag ?
        <OutsideClickHandler state={setConfirmTag}>
          <div className="tags-typeahead-confirm">
            {confirmTag.map((item, i) => (
              <button
                key={i}
                autoFocus={i === 0 ? true : null}
                onClick={updateConfirmTag}>
                {item}
              </button>
            ))}
          </div>
        </OutsideClickHandler>
        : null}
    </div>
  );
}

export default TagsTypeahead;
