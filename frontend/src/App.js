import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [st, setSt] = useState(null)

  const update = () => {
    fetch("http://localhost:4000/users")
      .then(res => res.json())
      .then(res => setSt({ res }));
  }
  return (
    <div className="App">
      <h1>HELLO</h1>
      {st ?
        <div>{st.res.map((item, i) => (
          <p>{item.email}</p>
        ))}
        </div> : <p>Loading</p>}
      <button onClick={update}>UPDATE</button>
    </div>
  );
}

export default App;
