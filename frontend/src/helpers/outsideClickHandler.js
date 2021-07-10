import React, { useRef, useEffect } from "react";

/**
 * https://stackoverflow.com/questions/32553158/detect-click-outside-react-component/42234988#42234988
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideClickHandler(ref, state) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        state(false)
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keyup", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keyup", handleClickOutside);
    };
  }, [ref, state]);
}

/**
 * Component that alerts if you click outside of it
 */
export default function OutsideClickHandler(props) {

  const wrapperRef = useRef(null);
  useOutsideClickHandler(wrapperRef, props.state);

  return <div ref={wrapperRef}>{props.children}</div>;
}