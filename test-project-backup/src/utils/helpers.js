// 工具函数文件
export const newFormatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const newValidateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const newDebounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// 使用旧函数的示例
export const processUserData = (user) => {
  const formattedDate = newFormatDate(user.createdAt);
  const isValidEmail = newValidateEmail(user.email);
  
  return {
    ...user,
    formattedDate,
    isValidEmail
  };
};
