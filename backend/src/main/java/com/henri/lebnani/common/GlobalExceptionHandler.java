package com.henri.lebnani.common;

import com.henri.lebnani.content.ContentValidationErrorResponse;
import com.henri.lebnani.content.ContentValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleBusinessException(BusinessException exception) {
        return new ErrorResponse(exception.getCode(), exception.getMessage());
    }

    @ExceptionHandler(ContentValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ContentValidationErrorResponse handleContentValidationException(ContentValidationException exception) {
        return new ContentValidationErrorResponse(exception.getErrors());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidationException(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Invalid request.");

        return new ErrorResponse("VALIDATION_ERROR", message);
    }
}