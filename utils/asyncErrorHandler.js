module.exports = (func) => {
  // Return a function that accepts request, response, and next middleware function
  return (req, res, next) => {
    // Execute the provided function 'func' asynchronously and catch any errors
    func(req, res, next).catch((err) => next(err));
  };
};
