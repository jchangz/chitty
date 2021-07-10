import React, { useEffect } from 'react';
import { useTagsState, useTagsDispatch, getTags } from '../../context'

function Tags() {
  const { tags } = useTagsState()
  const dispatchTags = useTagsDispatch()

  useEffect(() => {
    getTags(dispatchTags)
  }, [dispatchTags])

  return (
    <div>
      <h1>TAGS</h1>
      {tags && tags.map((item, i) => (
        <p key={item.tag_id}>{item.name} ({item.count})</p>
      ))}
    </div>
  );
}

export default Tags;
