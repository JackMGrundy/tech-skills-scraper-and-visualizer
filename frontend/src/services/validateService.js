const Joi = require("joi");

let validateProperty = ( name, value, schema) => {
    const obj = { [name]: value };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

let validateState = (state, schema) => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(state, schema, options);

    if (!error) return null;
    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };
  
  export default {
    validateProperty,
    validateState
  }