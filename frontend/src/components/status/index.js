import React, { useState, useRef } from 'react';
import { useSelectionsState, useSelectionsDispatch, usePostsDispatch, usePostsState } from '../../context';
import Notifications from '../notifications'
import '../../App.css';

function Status() {
  const { selectedItems } = useSelectionsState()
  const dispatchSelections = useSelectionsDispatch()
  const { posts, update } = usePostsState()
  const dispatchPosts = usePostsDispatch()
  const [notificationList, setNotificationList] = useState([])
  const notificationID = useRef(0)

  const deleteItems = async () => {
    // Remove highlight on selected items
    dispatchSelections({ type: 'resetSelections' })

    const response = await fetch("http://localhost:4000/collection/selections", {
      method: "POST",
      body: JSON.stringify(selectedItems),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const collection = await response.json()

    if (response.ok) {
      // Get successful delete requests '200'
      const deletedItems = collection.requestBody.map(function (res) {
        if (res.status === '200') {
          return res.id
        } else return false
      }).filter(res => { return res })

      // New posts based on successful requests
      const updatedPostsList = posts.filter(function (sdf) {
        return !deletedItems.includes(sdf.id)
      })

      // Dispatch posts update on delete
      dispatchPosts({ type: 'setPosts', posts: updatedPostsList, update: update + 1 })

      // Set new notification messages to pass to Notifications component
      setNotificationList(state => [{ notification: `${deletedItems.length} items deleted`, id: notificationID.current }, ...state])
      notificationID.current++
      return collection
    }
  }

  return (
    <div>
      <div className="status-message">
        {notificationList.map((item) => (
          <Notifications
            key={item.id}
            notification={item.notification}
            id={item.id}
            setNotificationList={setNotificationList}
          />
        ))}
      </div>
      <div className="status">
        {selectedItems && selectedItems.length > 0 && <p>{selectedItems.length} items selected</p>}
        {selectedItems.length > 0 && <button onClick={deleteItems}>DELETE</button>}
      </div>
    </div>
  );
}

export default Status;