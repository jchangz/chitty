import { useState, useRef, useEffect, useCallback } from "react";
import { usePostsState, useSelectionsState, useSelectionsDispatch, usePostsDispatch } from '../../context';
import ItemSetup from './itemSetup'

export default function DragReorder(contentRef, postsList) {
  const dispatchSelection = useSelectionsDispatch()
  const dispatchPosts = usePostsDispatch()
  const { posts, update } = usePostsState() // Use posts to map with the selected items array to send the correct format with dispatchSelection
  const { selectedItems } = useSelectionsState()
  const [dragging, setDragging] = useState(false) // State for dragging
  const [highlight, setHighlight] = useState(false) // Setup highlight for drag drop
  const [transform, setTransform] = useState(null)
  const [autoScroll, setAutoScroll] = useState(false)
  const [allowDrag, setAllowDrag] = useState(false)
  const selectedRow = useRef(null)
  const { rowCoords, colCoords, originalTransform } = ItemSetup(contentRef, postsList, setTransform)

  /**
   * Testing bounds for dragging rearranged items
   */
  useEffect(() => {
    dispatchSelection({ type: 'testCoords', tcoords: { rows: rowCoords, cols: colCoords } })
  }, [colCoords, rowCoords, dispatchSelection])

  /**
   * Trigger AutoScrolling
   */
  useEffect(() => {
    if (autoScroll) {
      const scrollValue = (autoScroll === 'down') ? 200 : -200
      const scroll = setInterval(() => {
        window.scrollBy(0, scrollValue)
      }, 100)
      return () => clearInterval(scroll)
    }
  }, [autoScroll])

  /**
   * Wait for transition to finish before allowing drag events
   * Without this delay, the bounds of the rearrange arent accurate, this way the item bounds are calculated after the animation
   */
  useEffect(() => {
    if (dragging) {
      const finishAnimation = setTimeout(() => {
        setAllowDrag(true)
      }, 150)
      return () => {
        clearTimeout(finishAnimation)
      }
    }
  }, [setAllowDrag, dragging])

  /**
   * onDragStart
   * 
   * Set Dragging to false -> changes post index alignment to stretch
   */
  const onDragStart = useCallback(() => {
    setDragging(true)
    setTransform(false)
  }, [])

  /**
   * onDrag
   * 
   * Check intersecting when dragging selections
   */
  const onDrag = useCallback((e) => {
    if (allowDrag) {
      let currentRow
      for (let i = 0; i < rowCoords.length; i++) {
        if (e.pageY < rowCoords[i].bottom && e.pageY > rowCoords[i].top) {
          if (rowCoords[i].top !== currentRow) {
            currentRow = rowCoords[i].top
          }
        }
      }
      if (currentRow) {
        for (let j = 0; j < colCoords[currentRow].length; j++) {
          if (e.pageX < colCoords[currentRow][j].right && e.pageX > colCoords[currentRow][j].left) {
            setHighlight(colCoords[currentRow][j].index)
            selectedRow.current = colCoords[currentRow][j].index
          }
        }
      }

      // Auto scroll when mouse is above or below window
      if (((e.pageY - 100) < window.scrollY) && window.scrollY !== 0) {
        setAutoScroll('up')
      } else if ((e.pageY + 100) > (window.innerHeight + window.scrollY) && (e.pageY + 100) < contentRef.current.offsetHeight) {
        setAutoScroll('down')
      } else {
        setAutoScroll(false)
      }
    }
  }, [colCoords, rowCoords, contentRef, allowDrag])

  /**
   * onDragEnd
   * 
   * If drop is out of bounds, we reset transform and dragging state here
   */
  const onDragEnd = useCallback((e) => {
    if (dragging) {
      // If out of drop bounds, reset dragging and apply original transform
      setDragging(false)
      setTransform(originalTransform.current)
    }
    setAutoScroll(false)
    setHighlight(false)
  }, [dragging, originalTransform])

  /**
   * onDragLeave
   * 
   * Remove highlight if dragging out of drop bounds
   * Passed into Posts component
   */
  const onDragLeave = () => {
    setHighlight(false)
  }

  /**
   * onDrop
   * 
   * Used to update Items when selection is dropped
   * Passed into Posts component
   */
  const onDrop = () => {
    setDragging(false)
    if (allowDrag) {
      const ids = selectedItems.map(item => item.id)
      // Post data array to be passed
      const dataArray = posts.map(item => {
        if (!ids.includes(item.id)) {
          return item
        } else {
          return false
        }
      })
      dataArray.splice(selectedRow.current, 0, ...selectedItems)
      const newPosts = dataArray.filter(item => item !== false)

      dispatchPosts({ type: 'setPosts', posts: newPosts, update: update + 1 })
    } else {
      // If item is dropped before animation is finished we cancel the event and reset to original status
      setTransform(originalTransform.current)
    }
    setAllowDrag(false)
  }

  useEffect(() => {
    window.addEventListener("dragstart", onDragStart)
    window.addEventListener("drag", onDrag)
    window.addEventListener("dragend", onDragEnd)
    return () => {
      window.addEventListener("dragstart", onDragStart)
      window.removeEventListener("drag", onDrag)
      window.removeEventListener("dragend", onDragEnd)
    }
  }, [onDragStart, onDrag, onDragEnd])

  return { dragging, transform, highlight, onDrop, onDragLeave };
}