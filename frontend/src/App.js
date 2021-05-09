import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function App() {
  const [st, setSt] = useState(null)
  const form = useRef(null)
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
    const formData = new FormData(form.current);
    const response = await fetch("http://localhost:4000/collection/new", {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      setRefresh(false)
      return response
    }
  }

  const deleteItem = async (e) => {
    const id = e.target.dataset.id
    const response = await fetch("http://localhost:4000/collection/delete/" + id, {
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
      <form ref={form} onSubmit={submitForm}>
        <input type="text" name="name" />
        <input type="submit"></input>
      </form>
      {st ?
        <div className="container">{st.res.map((item, i) => (
          <div className="container-item" >
            <p>{item.name}</p>
            <span onClick={deleteItem} data-id={item.id}>DELETE</span>
          </div>
        ))}
        </div> : <p>Loading</p>}
    </div>
  );
}

export default App;
