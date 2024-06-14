import React, { useState } from 'react';
import Select, { components } from 'react-select';

const Option = (props) => {
  return (
    <div title={props.data.tooltip}>
      <components.Option {...props} />
    </div>
  );
};

const CustomSelect = ({ options, value, onChange, isDisabled = false }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const customStyles = {
    control: (base) => ({
      ...base,
      minWidth: menuIsOpen ? '200px' : 'auto',
      transition: 'min-width 0.2s ease',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999, // Ensure dropdown menu is above other elements
    }),
  };

  const filterOption = (option, inputValue) => {
    const labelMatch = option.label.toLowerCase().includes(inputValue.toLowerCase());
    if (option.data.tooltip){
      const tooltipMatch = option.data.tooltip.toLowerCase().includes(inputValue.toLowerCase());
      return labelMatch || tooltipMatch; 
    }
    return labelMatch;
  };



  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      styles={customStyles}
      menuIsOpen={menuIsOpen}
      onMenuOpen={() => setMenuIsOpen(true)}
      onMenuClose={() => setMenuIsOpen(false)}
      components={{ Option }}
      classNamePrefix="react-select"
      isDisabled={isDisabled}
      filterOption={filterOption}
    />
  );
};

export default CustomSelect;
