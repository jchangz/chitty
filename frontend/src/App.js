import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function App() {
  const [st, setSt] = useState(null)
  const form = useRef(null)
  const imageForm = useRef(null)
  const webForm = useRef(null)
  const [refresh, setRefresh] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const getUpdate = async () => {
      const collection = await fetch("http://localhost:4000/collection")
      const response = await collection.json()
      setSt({ res: response })
      setRefresh(true)
    }
    if (!refresh) {
      getUpdate()
    }
  }, [refresh])

  const submitForm = async (e) => {
    e.preventDefault();
    const type = e.target.dataset.type
    var formType = false
    switch (type) {
      case 'text':
        formType = form.current;
        break;
      case 'image':
        formType = imageForm.current;
        break;
      case 'link':
        formType = webForm.current;
        break;
    }
    const formData = new FormData(formType)
    const response = await fetch("http://localhost:4000/collection/add" + type, {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      setRefresh(false)
      if (response.status === 206) {
        const { url, id, title } = await response.json().then(body => body)
        getScreenshot({ url, id, title })
      }
      return response
    }
    else {
      var body = await response.text();
      setError(response.statusText, body)
    }
  }

  const getScreenshot = async (item) => {
    const response = await fetch("http://localhost:4000/collection/getscreenshot", {
      method: "POST",
      body: JSON.stringify(item),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      setRefresh(false)
      return response
    }
    else {
      var body = await response.text();
      setError(response.statusText, body)
    }
  }

  const removeTag = async (item) => {
    const type = item.image ? "image" : "text"
    const response = await fetch("http://localhost:4000/collection/delete?id=" + item.id + '&type=' + type, {
      method: "DELETE",
    })
    if (response.ok) {
      setRefresh(false)
      return response
    }
  }

  return (
    <div className="App">
      <h1>HELLO</h1>
      <p>{error}</p>
      <form ref={form} onSubmit={submitForm} data-type="text">
        <input type="text" name="name" />
        <input type="submit"></input>
      </form>
      <form ref={imageForm} onSubmit={submitForm} data-type="image">
        <input type="text" name="name" />
        <input type="file" id="image" name="image" accept="image/*" />
        <input type="submit"></input>
      </form>
      <form ref={webForm} onSubmit={submitForm} data-type="link">
        <input type="url" name="url" />
        <input type="submit"></input>
      </form>
      {st ?
        <div className="container">{st.res.map((item, i) => (
          <div className="container-item" key={item.id} >
            <p>{item.name}</p>
            <img src={item.url}></img>
            <button onClick={removeTag.bind(null, item)}>Delete</button>
          </div>
        ))}
        </div> : <p>Loading</p>}
    </div>
  );
}

export default App;
