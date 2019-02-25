import React, { Component } from 'react';
import Input from "./input.jsx";

class aliasedInput extends Component {
    state = {  }
    render() { 
        const { titleLabel, name, title, aliases, handleTitleChange, handleAliasChange } = this.props;
        return ( 
            <div>
            <Input
            label={titleLabel}
            name={name}
            value={title}
            onChange={handleTitleChange}
            margin=""
            size={"form-control-lg"}
          />
          <Input
            label="Aliases"
            name={name}
            value={aliases}
            onChange={handleAliasChange}
            margin="ml-5"
            size={"form-control-sm"}
          />
          </div>
         );
    }
}
 
export default aliasedInput;