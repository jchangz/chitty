import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function App() {
  const [st, setSt] = useState(null)
  const form = useRef(null)
  const imageForm = useRef(null)
  const [refresh, setRefresh] = useState(false)

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
    const formData = (type === 'image') ? new FormData(imageForm.current) : new FormData(form.current)
    const response = await fetch("http://localhost:4000/collection/add" + type, {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      setRefresh(false)
      return response
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
      <form ref={form} onSubmit={submitForm} data-type="text">
        <input type="text" name="name" />
        <input type="submit"></input>
      </form>
      <form ref={imageForm} onSubmit={submitForm} data-type="image">
        <input type="text" name="name" />
        <input type="file" id="image" name="image" accept="image/*" />
        <input type="submit"></input>
      </form>
      {st ?
        <div className="container">{st.res.map((item, i) => (
          <div className="container-item" key={item.id} >
            <p>{item.name}</p>
            <p>{item.image}</p>
            <img src={item.url}></img>
            <button onClick={removeTag.bind(null, item)}>Delete</button>
          </div>
        ))}
        </div> : <p>Loading</p>}
    </div>
  );
}

export default App;
