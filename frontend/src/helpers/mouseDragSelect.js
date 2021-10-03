import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePostsState, useSelectionsState, useSelectionsDispatch } from '../context';

export default function MouseDragSelect(props) {
  const dispatchSelection = useSelectionsDispatch()
  const { posts } = usePostsState() // Use posts to map with the selected items array to send the correct format with dispatchSelection
  const { selectedItems, tcoords } = useSelectionsState()

  const initialMousePosition = useRef(null) // Mouse position on inital click
  const wrapperRef = useRef(null) // Ref of this component to get the left bounds so select box wont go beyond
  const windowScrollY = useRef(null) // Keep reference to the scrolled window Y position (only updates when the nodes update)

  const [isMouseClicked, setIsMouseClicked] = useState(false) // State for initial mouse click
  const [isMouseDragging, setIsMouseDragging] = useState(false) // State for mouse drag
  const [selectionBoxCoord, setSelectionBoxCoord] = useState(false) // Coordinates for top and left of selection box
  const [selectionBoxRect, setSelectionBoxRect] = useState(false) // Coordinates for width and height of selection box
  const [childNodeList, setChildNodeList] = useState(false) // Keep coordinates of children nodes for intersection comparison
  const [autoScroll, setAutoScroll] = useState(false) // State for automatic scrolling

  const [tester, setTester] = useState(false)

  useEffect(() => {
    /**
     * Setup the array map containing the bounds of the items
     * Used to compare with the mouse select box to determine intersection
     * Needs to run on event isMouseDragging to get the latest nodes
     */
    if (props.children.ref.current && isMouseDragging) {
      const childNodes = props.children.ref.current.childNodes
      if (childNodes.length > 0) {
        windowScrollY.current = window.scrollY // Update Y scroll reference
        const childNodeArray = [...childNodes] // Create array object to access map function
        setChildNodeList(childNodeArray.map(child => {
          const coodinates = child.getBoundingClientRect()
          return ({
            top: coodinates.top,
            left: coodinates.left,
            right: coodinates.right,
            bottom: coodinates.bottom
          })
        }))
      }
    }
  }, [isMouseDragging, props.children.ref])

  const mouseClick = (e) => {
    /**
     * Return true if we are clicking on this component
     * Otherwise let the native child click events fire
     */
    if (e.target === props.children.ref.current) {
      initialMousePosition.current = [e.pageX, e.pageY] // Set initial click position
      setIsMouseClicked(true)
      if (selectedItems.length > 0) {
        dispatchSelection({ type: 'resetSelections' })
      }
      return true
    }
  }

  const mouseDrag = useCallback((e) => {
    setIsMouseDragging(true)
    const initialX = initialMousePosition.current[0]
    const initialY = initialMousePosition.current[1]
    const currentX = initialX < e.pageX ? initialX : e.pageX // If moving right, left attribute of box is initial position otherwise it is cursor position
    const currentY = initialY < e.pageY ? initialY : e.pageY // If moving down, top attribute of box is cursor position, otherwise it is initial position
    const leftBounds = wrapperRef.current.offsetLeft
    const selectionX = e.pageX < leftBounds ? initialX - leftBounds : Math.abs(initialX - e.pageX)  // Condition if mouse position is beyond the left bounds
    const newX = currentX < leftBounds ? leftBounds : currentX

    setSelectionBoxRect([selectionX, Math.abs(initialY - e.pageY)])
    setSelectionBoxCoord([newX, currentY - window.scrollY])

    // Using scroll wheel doesnt update the nodes reference, so we need to keep track of the original scrollY position to properly set the intersecting items
    const rect = {
      left: newX,
      top: currentY - windowScrollY.current,
      right: newX + Math.abs(initialX - e.pageX),
      bottom: (currentY + Math.abs(initialY - e.pageY) - windowScrollY.current),
    }

    if (childNodeList) {
      /**
       * Test for dragging bounds
       */
      const teser = {}
      childNodeList.forEach((item, i) => {
        if (rect.left < item.right && rect.right > item.left && rect.top < item.bottom && rect.bottom > item.top) {
          teser[posts[i].id] = true;
        }
      })
      /** */
      const selections = childNodeList.map((item, i) => {
        if (rect.left < item.right && rect.right > item.left && rect.top < item.bottom && rect.bottom > item.top) {
          return i
        }
        return false
      }).filter(item => { return item !== false })

      if (selectedItems.length !== selections.length) {
        const selectionItems = selections.map(item => posts[item])
        dispatchSelection({ type: 'setSelectedItems', selectedItems: selectionItems })
      }
    }

    // Auto scroll when mouse is above or below window
    if (((e.pageY - 100) < window.scrollY) && window.scrollY !== 0) {
      setAutoScroll('up')
    } else if ((e.pageY + 100) > (window.innerHeight + window.scrollY) && (e.pageY + 100) < wrapperRef.current.offsetHeight) {
      setAutoScroll('down')
    } else {
      setAutoScroll(false)
    }
  }, [childNodeList, posts, selectedItems, dispatchSelection])


  useEffect(() => {
    if (autoScroll) {
      const scrollValue = (autoScroll === 'down') ? 200 : -200
      const scroll = setInterval(() => {
        window.scrollBy(0, scrollValue)
      }, 100)
      return () => clearInterval(scroll)
    }
  }, [autoScroll])

  const mouseUp = useCallback((e) => {
    e.preventDefault()
    setIsMouseClicked(false)
    setIsMouseDragging(false)
    setSelectionBoxCoord(false)
    setSelectionBoxRect(false)
    setAutoScroll(false)
    initialMousePosition.current = false
  }, [])

  const mouseDrag3 = useCallback(() => {
    const testings = []
    if (tcoords) {
      tcoords.rows.forEach(item => {
        tcoords.cols[item.top].forEach(item2 => {
          testings.push({ top: item.top, left: item2.left, width: item2.right - item2.left, height: item.bottom - item.top, index: item2.index })
        })
      })
    }
    setTester(testings)
  }, [tcoords])

  const mouseDrag4 = useCallback(() => {
    setTester(false)
  }, [])

  useEffect(() => {
    window.addEventListener("dragstart", mouseDrag3)
    window.addEventListener("dragend", mouseDrag4)
    return () => {
      window.removeEventListener("dragstart", mouseDrag3)
      window.removeEventListener("dragend", mouseDrag4)
    }
  }, [mouseDrag3, mouseDrag4])

  useEffect(() => {
    if (isMouseClicked) {
      window.addEventListener("mousemove", mouseDrag)
      window.addEventListener("mouseup", mouseUp)
      return () => {
        window.removeEventListener("mousemove", mouseDrag)
        window.removeEventListener("mouseup", mouseUp)
      }
    }
  }, [isMouseClicked, mouseDrag, mouseUp])

  return (
    <div
      draggable="false"
      onMouseDown={mouseClick}
      ref={wrapperRef}>
      {props.children}
      {/* <div style={{ pointerEvents: 'none' }}>
        {tester && tester.map((item) => (
          <span style={{ position: 'absolute', top: item.top, left: item.left, height: item.height, width: item.width, border: '1px solid #283574' }}></span>
        ))}
      </div> */}
      {isMouseDragging &&
        <div className="selectbox"
          style={{
            top: selectionBoxCoord[1],
            left: selectionBoxCoord[0],
            width: selectionBoxRect[0],
            height: selectionBoxRect[1]
          }}>
        </div>
      }
    </div>
  );
}