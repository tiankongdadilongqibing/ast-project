import React, { useState } from 'react';
import PropTypes from 'prop-types';

// 这是一个旧的Input组件
const OldInput = ({ value, onChange, placeholder, type = 'text' }) => {
  const [inputValue, setInputValue] = useState(value || '');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <input
      type={type}
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="old-input-class"
    />
  );
};

OldInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  type: PropTypes.string
};

export default OldInput;
