import React from 'react';
import OldButton from '../../components/Button';
import OldInput from '../../components/Input';
import { oldFormatDate, oldValidateEmail } from '../../utils/helpers';

const HomePage = () => {
  const handleButtonClick = () => {
    console.log('Button clicked!');
  };

  const handleInputChange = (value) => {
    console.log('Input changed:', value);
  };

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2023-01-01'
  };

  return (
    <div className="home-page">
      <h1>Welcome to Home Page</h1>
      
      <div className="user-info">
        <p>User: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Created: {oldFormatDate(user.createdAt)}</p>
        <p>Valid Email: {oldValidateEmail(user.email) ? 'Yes' : 'No'}</p>
      </div>

      <div className="components">
        <OldButton onClick={handleButtonClick}>
          Click Me
        </OldButton>
        
        <OldInput
          placeholder="Enter your name"
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default HomePage;
