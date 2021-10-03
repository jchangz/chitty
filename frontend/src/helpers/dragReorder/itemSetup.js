import { useState, useRef, useEffect } from "react";
import { useSelectionsDispatch } from '../../context';

export default function ItemSetup(contentRef, postsList, setTransform) {
  const dispatchSelection = useSelectionsDispatch()
  const [rowCoords, setRowCoords] = useState([])
  const [colCoords, setColCoords] = useState([])
  const originalTransform = useRef()
  const [originalCoordinates, setOriginalCoordinates] = useState([])
  const [columnLength, setColumnLength] = useState(false)

  /**
   * Setup Item Coordinates
   */
  useEffect(() => {
    if (postsList) {
      const childArray = [...contentRef.current.children]
      const originalArray = childArray.map(child => {
        const coodinates = child.getBoundingClientRect()
        return ({
          top: coodinates.top + window.scrollY,
          left: coodinates.left,
          right: coodinates.right,
          bottom: coodinates.bottom + window.scrollY,
          width: child.offsetWidth
        })
      })
      setOriginalCoordinates(originalArray)
    }
  }, [postsList, contentRef])

  /**
   * Setup Transforms for Items
   */
  useEffect(() => {
    if (originalCoordinates.length) {
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
        const newArr = set.map(height => height - maxHeight)
        return newArr
      })
      setColumnLength(childMap[0].length)

      const initialArr = Array(childMap[0].length).fill(0) // Use to initialize reducer

      const childMapAgg = childMap.reduce((arr, item, i) => {
        const newArr = arr[i].map((a, i) => a + item[i])
        arr.push(newArr)
        return arr
      }, [initialArr])

      const childTransform = [].concat(...childMapAgg)
      originalTransform.current = childTransform
      setTransform(childTransform)
    }
  }, [originalCoordinates, contentRef, dispatchSelection, setTransform])

  /**
   * Setup Array for each offsetHeight
   */
  useEffect(() => {
    if (columnLength) {
      const half = contentRef.current.offsetWidth / columnLength
      const rows = {}
      const height = {}
      originalCoordinates.forEach(function (item, index) {
        if (rows[parseInt(item.top)]) {
          height[parseInt(item.top)].push(item.bottom)
        }
        else {
          const colArr = []
          for (var i = 0; i < (columnLength + 1); i++) {
            if (i === 0) {
              colArr.push({ left: contentRef.current.offsetLeft, right: contentRef.current.offsetLeft + (half / 2), index: index })
            } else {
              colArr.push({ left: colArr[i - 1].right, right: colArr[i - 1].right + half, index: i + index })
            }
          }
          rows[parseInt(item.top)] = colArr
          height[parseInt(item.top)] = [item.bottom]
        }
        return { top: item.top }
      })
      setColCoords(rows)
      const iterate = Object.keys(height)
      const newRowCoords = iterate.map(function (res) {
        return { top: parseInt(res), bottom: parseInt(Math.max(...height[res])) }
      })
      setRowCoords(newRowCoords)
    }
  }, [originalCoordinates, contentRef, columnLength])

  return { rowCoords, colCoords, originalTransform };
}