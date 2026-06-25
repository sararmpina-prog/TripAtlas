import { ValidationError } from '../utils/appErrors.js';

export const validateIdParam = (paramName) =>
  (req, res, next) => {
    const id = Number(req.params[paramName]);

    console.log("paramName", paramName)
    console.log("id", id)

    if (!Number.isInteger(id) || id <= 0) {
      return next(
        new ValidationError(`Invalid ${paramName}.`)
      );
    }

    req.params[paramName] = id;
    console.log("req.params[paramName]", req.params[paramName])

    next();
  };