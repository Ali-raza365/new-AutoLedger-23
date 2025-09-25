"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendValidationError = exports.sendError = exports.sendSuccess = void 0;
var sendSuccess = function (res, data, message, statusCode) {
    if (message === void 0) { message = "Success"; }
    if (statusCode === void 0) { statusCode = 200; }
    var response = {
        success: true,
        message: message,
        data: data,
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
var sendError = function (res, message, statusCode, errors) {
    if (message === void 0) { message = "Internal Server Error"; }
    if (statusCode === void 0) { statusCode = 500; }
    var response = {
        success: false,
        message: message,
        errors: errors,
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
var sendValidationError = function (res, errors, message) {
    if (message === void 0) { message = "Validation failed"; }
    return (0, exports.sendError)(res, message, 400, errors);
};
exports.sendValidationError = sendValidationError;
