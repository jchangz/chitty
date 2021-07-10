import React, { useRef } from 'react';
import Tags from './components/tags'
import Posts from './components/posts'
import { PostsProvider, TagsProvider } from './context/context'
import './App.css';

function App() {
  const form = useRef(null)
  const imageForm = useRef(null)
  const webForm = useRef(null)

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
      default:
        throw new Error()
    }
    const formData = new FormData(formType)
    const response = await fetch("http://localhost:4000/collection/add" + type, {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      // setRefresh(false)
      if (response.status === 206) {
        const { url, id, title } = await response.json().then(body => body)
        getScreenshot({ url, id, title })
      }
      return response
    }
    else {
      // var body = await response.text();
      // setError(response.statusText, body)
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
      // setRefresh(false)
      return response
    }
    else {
      // var body = await response.text();
      // setError(response.statusText, body)
    }
  }

  return (
    <div className="App">
      <PostsProvider>
        <TagsProvider >
          <div className="body">
            <div className="tags-body">
              <Tags />
            </div>
            <div className="content-body">
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
              <Posts />
            </div>
          </div>
        </TagsProvider>
      </PostsProvider>
    </div>
  );
}

export default App;
