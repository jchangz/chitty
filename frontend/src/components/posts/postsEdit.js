import React, { useCallback } from 'react';
import { useSelectionsDispatch } from '../../context';
import '../../App.css';

function PostsEdit({ item, highlight }) {
  const dispatchSelection = useSelectionsDispatch()

  const selectPost = useCallback(() => {
    dispatchSelection({ type: 'setSelectedItems', selectedItems: [item] })
  }, [dispatchSelection, item])

  return (
    <div
      {...(!highlight && { onClick: selectPost })}
      className={(highlight ? "container-editing" : "container-edit")}
    />
  )
}

export default React.memo(PostsEdit);