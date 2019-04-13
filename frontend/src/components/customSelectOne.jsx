import React, { Component } from 'react';
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
const shortid = require("shortid");

class CustomeSelectOne extends Component {
    render() { 
        const {value, handleSelect, items, header} = this.props;
        return ( 
            <FormControl>
            <Select
              value={value}
              onChange={handleSelect}
              displayEmpty
              name="selectedMapTech"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {items
                ? items.map(item => {
                    return (
                      <MenuItem
                        key={shortid.generate()}
                        value={item}
                      >
                        {item}
                      </MenuItem>
                    );
                  })
                : ""}
            </Select>
            <FormHelperText>{header}</FormHelperText>
          </FormControl>
         );
    }
}
 
export default CustomeSelectOne;