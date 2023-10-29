import React from 'react';
import ReactDOM from 'react-dom';
import LogSearch from './LogSearch';

const App = () => {
  return (
    <div>
      <LogSearch />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
export default App;
