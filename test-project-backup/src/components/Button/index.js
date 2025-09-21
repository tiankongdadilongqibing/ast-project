import React from 'react';
import PropTypes from 'prop-types';

// 这是一个旧的Button组件
const NewButton = ({ children, onClick, type = 'button' }) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      className="new-button-class"
    >
      {children}
    </button>
  );
};

NewButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string
};

export default NewButton;
