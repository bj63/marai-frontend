import React from 'react';

type ButtonProps = {
  theme: 'pastel' | 'cyberpunk';
  variant: 'primary' | 'secondary' | 'accent';
  onClick: () => void;
  children: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ theme, variant, onClick, children }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-bold';

  const themeClasses = {
    pastel: {
      primary: 'bg-pastel-primary text-pastel-text',
      secondary: 'bg-pastel-secondary text-pastel-text',
      accent: 'bg-pastel-accent text-pastel-text',
    },
    cyberpunk: {
      primary: 'bg-cyberpunk-primary text-cyberpunk-text',
      secondary: 'bg-cyberpunk-secondary text-cyberpunk-text',
      accent: 'bg-cyberpunk-accent text-cyberpunk-text',
    },
  };

  const classes = `${baseClasses} ${themeClasses[theme][variant]}`;

  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
