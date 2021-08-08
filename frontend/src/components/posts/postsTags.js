import React, { useState, useEffect } from 'react';
import TagsTypeahead from '../tags/tagsTypeahead'
import OutsideClickHandler from '../../helpers/outsideClickHandler'
import '../tags/tags.css';

function PostsTags({ id, currentTags }) {
  const [editState, setEditState] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setError(false)
    }, 1000);
  }, [error]);

  return (
    <div className="tags-container">
      <span
        className="tags-typeahead-tag"
        onClick={() => setEditState(true)}
      >
        #
      </span>
      {editState &&
        <OutsideClickHandler state={setEditState}>
          <TagsTypeahead
            id={id}
            currentTags={currentTags}
            setError={setError}
            setEditState={setEditState}
          />
          {error &&
            <div className="tags-error">{error}</div>
          }
        </OutsideClickHandler>
      }
      {currentTags.length > 0 &&
        <div
          className="tags-existing"
          onClick={() => setEditState(true)}
        >
          {currentTags.map((tag) => (
            <span
              className="tags-typeahead-tag"
              key={tag.id}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      }
    </div>
  )
}

export default React.memo(PostsTags);